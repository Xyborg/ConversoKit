import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createBridge } from '../createBridge.js';

describe('createBridge', () => {
  beforeEach(() => {
    delete (window as unknown as { openai?: unknown }).openai;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as unknown as { openai?: unknown }).openai;
  });

  it('falls back to fetch when window.openai is absent', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] })
    });
    vi.stubGlobal('fetch', fetchMock);

    const bridge = createBridge({ baseUrl: 'http://test.local' });
    const result = await bridge.callTool('search_products', { query: '' });

    expect(result).toEqual({ items: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://test.local/tools/search_products',
      expect.objectContaining({ method: 'POST' })
    );
    expect(bridge.isHostBridge()).toBe(false);
  });

  it('prefers window.openai.callTool when available', async () => {
    const hostCall = vi.fn().mockResolvedValue({ stub: true });
    (window as unknown as { openai: { callTool: typeof hostCall } }).openai = {
      callTool: hostCall
    };
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const bridge = createBridge();
    const result = await bridge.callTool('any_tool', { foo: 'bar' });

    expect(result).toEqual({ stub: true });
    expect(hostCall).toHaveBeenCalledWith('any_tool', { foo: 'bar' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(bridge.isHostBridge()).toBe(true);
  });

  it('forwards apiKey + consent + sessionId headers in fallback path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    const bridge = createBridge({
      baseUrl: 'http://test.local',
      apiKey: 'devkey',
      sessionId: 'sess-1',
      consent: { scopes: ['analytics'], acceptedAt: '2026-01-01T00:00:00Z' }
    });
    await bridge.callTool('search_products', { query: '' });

    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer devkey');
    expect(headers['x-conversokit-session']).toBe('sess-1');
    expect(headers['x-conversokit-consent']).toContain('analytics');
  });
});
