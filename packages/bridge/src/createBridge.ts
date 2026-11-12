import { App } from '@modelcontextprotocol/ext-apps';
import { consentRecordSchema, type Tool } from '@conversokit/shared';
import type {
  Bridge,
  BridgeEventHandler,
  BridgeOptions,
  ToolInput,
  ToolOutput
} from './types.js';

export function createBridge(options: BridgeOptions = {}): Bridge {
  const sessionId =
    options.sessionId ??
    globalThis.crypto?.randomUUID?.() ??
    `sess_${Date.now()}_${Math.random()}`;
  const handlers = new Set<BridgeEventHandler>();
  let app: App | undefined;
  let ready: Promise<void> | undefined;
  let output: unknown;
  let consent = options.consent;
  let closed = false;
  let resizeObserver: ResizeObserver | undefined;
  let resizeFrame: number | undefined;
  const embedded = typeof window !== 'undefined' && window.parent !== window;
  const mode = options.mode ?? (embedded ? 'mcp' : 'auto');
  const useMcp = mode === 'mcp';
  const legacy = () =>
    mode !== 'local' && typeof window !== 'undefined' && !!window.openai?.callTool;
  const emit = (type: string, payload: unknown) =>
    handlers.forEach((h) => h({ type, payload }));

  function unwrap(result: unknown): unknown {
    if (result && typeof result === 'object') {
      const r = result as {
        isError?: boolean;
        structuredContent?: unknown;
        content?: { type: string; text?: string }[];
      };
      if (r.isError)
        throw new BridgeError(
          r.content
            ?.filter((c) => c.type === 'text')
            .map((c) => c.text)
            .join('\n') || 'Tool failed',
          400
        );
      if (r.structuredContent !== undefined) return r.structuredContent;
    }
    return result;
  }
  function receive(result: unknown) {
    try {
      output = unwrap(result);
      emit('tool-result', output);
    } catch (error) {
      emit('error', error);
    }
  }
  function consentChanged(event: Event) {
    const parsed = consentRecordSchema.safeParse((event as CustomEvent).detail);
    if (parsed.success) consent = parsed.data;
  }
  function globalsChanged() {
    if (window.openai?.toolOutput !== undefined) receive(window.openai.toolOutput);
  }
  function connect(): Promise<void> {
    if (closed) return Promise.reject(new BridgeError('Bridge is closed', 410));
    if (ready) return ready;
    if (typeof window !== 'undefined') {
      window.addEventListener('openai:set_globals', globalsChanged);
      window.addEventListener('conversokit:consent', consentChanged);
      globalsChanged();
    }
    if (useMcp) {
      app = new App(
        { name: 'conversokit-widget', version: '0.2.0' },
        {},
        { autoResize: false }
      );
      app.ontoolresult = receive;
      ready = app
        .connect(options.transport, {
          timeout: options.connectTimeoutMs ?? 15000
        })
        .then(() => {
          if (closed || typeof ResizeObserver === 'undefined') return;
          const resize = () => {
            if (closed) return;
            if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => {
              resizeFrame = undefined;
              if (!closed)
                void app!
                  .sendSizeChanged({
                    height: document.documentElement.scrollHeight,
                    width: document.documentElement.clientWidth
                  })
                  .catch((error) => {
                    if (!closed) emit('error', error);
                  });
            });
          };
          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(document.documentElement);
          resize();
        });
    } else ready = Promise.resolve();
    return ready;
  }
  function readConsent() {
    if (consent) return consent;
    // ConsentBanner writes only after an explicit user acceptance. Storage may be
    // unavailable in sandboxed iframes; callers can instead use setConsent().
    try {
      const value = JSON.parse(
        window.sessionStorage.getItem('conversokit:consent') ?? 'null'
      );
      const parsed = consentRecordSchema.safeParse(value);
      return parsed.success ? parsed.data : undefined;
    } catch {
      return undefined;
    }
  }
  async function callTool<T extends Tool>(
    nameOrTool: string | T,
    input: T extends Tool ? ToolInput<T> : Record<string, unknown>
  ): Promise<T extends Tool ? ToolOutput<T> : unknown> {
    await connect();
    const name = typeof nameOrTool === 'string' ? nameOrTool : nameOrTool.name;
    const currentConsent = readConsent();
    let result: unknown;
    if (app) {
      result = unwrap(
        await app.callServerTool({
          name,
          arguments: input,
          _meta: {
            'conversokit/context': {
              sessionId,
              ...(currentConsent ? { consent: currentConsent } : {})
            }
          }
        })
      );
    } else if (legacy()) {
      result = unwrap(await window.openai!.callTool!(name, input));
    } else {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-conversokit-session': sessionId
      };
      if (options.apiKey) headers.Authorization = `Bearer ${options.apiKey}`;
      if (currentConsent)
        headers['x-conversokit-consent'] = JSON.stringify(currentConsent);
      const response = await fetch(
        `${options.baseUrl ?? 'http://localhost:3000'}/tools/${encodeURIComponent(name)}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(input)
        }
      );
      if (!response.ok)
        throw new BridgeError(
          `Tool ${name} failed: ${await response.text()}`,
          response.status
        );
      result = await response.json();
    }
    return result as T extends Tool ? ToolOutput<T> : unknown;
  }
  async function openLink(url: string) {
    if (!['https:', 'http:'].includes(new URL(url).protocol))
      throw new BridgeError('Only HTTP(S) links are supported', 400);
    await connect();
    if (app) {
      const result = await app.openLink({ url });
      if (result.isError) throw new BridgeError('Host declined to open the link', 400);
    } else if (window.openai?.openExternal)
      await window.openai.openExternal({ href: url });
    else if (window.openai?.openExternalUrl) await window.openai.openExternalUrl(url);
    else window.location.assign(url);
  }
  return {
    callTool,
    connect,
    openLink,
    setConsent(value) {
      consent = value;
    },
    getToolOutput: () => output,
    async getSession() {
      if (!useMcp && legacy() && window.openai?.getSession)
        return window.openai.getSession();
      return { sessionId, authenticated: !useMcp && Boolean(options.apiKey) };
    },
    onEvent(handler) {
      handlers.add(handler);
      const unsubscribe =
        !useMcp && legacy() ? window.openai?.onEvent?.(handler) : undefined;
      return () => {
        handlers.delete(handler);
        unsubscribe?.();
      };
    },
    isHostBridge: () => useMcp || legacy(),
    async close() {
      closed = true;
      resizeObserver?.disconnect();
      if (resizeFrame !== undefined) cancelAnimationFrame(resizeFrame);
      if (typeof window !== 'undefined') {
        window.removeEventListener('openai:set_globals', globalsChanged);
        window.removeEventListener('conversokit:consent', consentChanged);
      }
      handlers.clear();
      await app?.close();
    }
  };
}
export class BridgeError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'BridgeError';
  }
}
