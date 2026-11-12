import { expect, it, vi } from 'vitest';
import { AppBridge } from '@modelcontextprotocol/ext-apps/app-bridge';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createBridge } from '../createBridge.js';

it('initializes MCP Apps even when window.openai exists, delivers results and forwards metadata and links', async () => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    }
  );
  const host = new AppBridge(
    null,
    { name: 'test-host', version: '1' },
    { serverTools: {}, openLinks: {} }
  );
  const call = vi.fn(async () => ({
    content: [],
    structuredContent: { items: ['one'] }
  }));
  const open = vi.fn(async () => ({}));
  host.oncalltool = call;
  host.onopenlink = open;
  const [a, b] = InMemoryTransport.createLinkedPair();
  window.openai = { callTool: vi.fn(), toolOutput: { initial: true } };
  const bridge = createBridge({
    mode: 'mcp',
    transport: b,
    sessionId: 'cart-1',
    consent: { scopes: ['personalData'], acceptedAt: '2026-11-12' }
  });
  const event = vi.fn();
  bridge.onEvent(event);
  await host.connect(a);
  try {
    await bridge.connect();
    expect(bridge.getToolOutput()).toEqual({ initial: true });
    await host.sendToolInput({ arguments: {} });
    await host.sendToolResult({ content: [], structuredContent: { products: [1] } });
    expect(bridge.getToolOutput()).toEqual({ products: [1] });
    expect(await bridge.callTool('search_products', {})).toEqual({ items: ['one'] });
    expect(call.mock.calls[0][0]).toMatchObject({
      _meta: {
        'conversokit/context': {
          sessionId: 'cart-1',
          consent: { scopes: ['personalData'] }
        }
      }
    });
    expect(window.openai.callTool).not.toHaveBeenCalled();
    await bridge.openLink('https://example.com/checkout');
    expect(open).toHaveBeenCalled();
    await expect(bridge.openLink('javascript:alert(1)')).rejects.toThrow('HTTP');
  } finally {
    await bridge.close();
    await host.close();
    delete window.openai;
    vi.unstubAllGlobals();
  }
});

it('does not silently fall back to REST when the MCP host handshake fails', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  const [, transport] = InMemoryTransport.createLinkedPair();
  const bridge = createBridge({ mode: 'mcp', transport, connectTimeoutMs: 20 });
  try {
    await expect(bridge.callTool('search_products', {})).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  } finally {
    await bridge.close();
    vi.unstubAllGlobals();
  }
});
