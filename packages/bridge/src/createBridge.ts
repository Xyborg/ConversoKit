import type { Tool } from '@conversokit/shared';
import type {
  Bridge,
  BridgeEventHandler,
  BridgeOptions,
  BridgeSession,
  ToolInput,
  ToolOutput
} from './types.js';

function resolveName<T extends Tool>(nameOrTool: string | T): string {
  return typeof nameOrTool === 'string' ? nameOrTool : nameOrTool.name;
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function createBridge(options: BridgeOptions = {}): Bridge {
  const {
    baseUrl = 'http://localhost:3000',
    apiKey,
    consent,
    sessionId: providedSessionId
  } = options;
  const sessionId = providedSessionId ?? generateSessionId();
  const eventHandlers = new Set<BridgeEventHandler>();

  function isHostBridge(): boolean {
    return (
      typeof window !== 'undefined' && typeof window.openai?.callTool === 'function'
    );
  }

  async function callTool<T extends Tool>(
    nameOrTool: string | T,
    input: T extends Tool ? ToolInput<T> : Record<string, unknown>
  ): Promise<T extends Tool ? ToolOutput<T> : unknown> {
    const name = resolveName(nameOrTool);
    if (isHostBridge() && typeof window !== 'undefined' && window.openai?.callTool) {
      return (await window.openai.callTool(name, input)) as T extends Tool
        ? ToolOutput<T>
        : unknown;
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-conversokit-session': sessionId
    };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    if (consent) {
      headers['x-conversokit-consent'] = JSON.stringify(consent);
    }
    const response = await fetch(`${baseUrl}/tools/${name}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input)
    });
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new BridgeError(
        `Tool ${name} failed with status ${response.status}: ${message}`,
        response.status
      );
    }
    return (await response.json()) as T extends Tool ? ToolOutput<T> : unknown;
  }

  async function getSession(): Promise<BridgeSession> {
    if (isHostBridge() && window.openai?.getSession) {
      return await window.openai.getSession();
    }
    return { sessionId, authenticated: Boolean(apiKey) };
  }

  function onEvent(handler: BridgeEventHandler): () => void {
    if (isHostBridge() && window.openai?.onEvent) {
      return window.openai.onEvent(handler);
    }
    eventHandlers.add(handler);
    return () => eventHandlers.delete(handler);
  }

  return { callTool, getSession, onEvent, isHostBridge };
}

export class BridgeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'BridgeError';
    this.status = status;
  }
}
