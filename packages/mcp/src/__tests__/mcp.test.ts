import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { defineTool, type ToolContext } from '@conversokit/shared';
import { createMcpServer, executeTool } from '../index.js';

const context: ToolContext = { sessionId: 'test', logger: console };
const tool = defineTool({
  name: 'echo',
  description: 'Echo a value',
  inputSchema: z.object({ value: z.string() }),
  outputSchema: z.object({ value: z.string() }),
  permissions: {},
  annotations: { readOnlyHint: true },
  widget: 'ui://test/app.html',
  async handler(input) {
    return input;
  }
});
describe('MCP adapter', () => {
  it('initializes, lists/calls tools and reads the HTML resource using the official client', async () => {
    const server = createMcpServer(
      {
        name: 'test',
        version: '1',
        tools: [tool],
        widgets: [{ uri: tool.widget!, name: 'app', html: () => '<html>App</html>' }]
      },
      context
    );
    const client = new Client({ name: 'test', version: '1' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(a);
    await client.connect(b);
    try {
      const listed = await client.listTools();
      expect(listed.tools[0].annotations?.readOnlyHint).toBe(true);
      expect(listed.tools[0]._meta?.ui).toEqual({ resourceUri: tool.widget });
      expect(
        (await client.callTool({ name: 'echo', arguments: { value: 'hello' } }))
          .structuredContent
      ).toEqual({ value: 'hello' });
      expect(
        (await client.callTool({ name: 'echo', arguments: { value: 2 } })).isError
      ).toBe(true);
      expect((await client.listResources()).resources).toHaveLength(1);
      const resource = await client.readResource({ uri: tool.widget! });
      expect(resource.contents[0].mimeType).toBe('text/html;profile=mcp-app');
      expect(resource.contents[0].text).toContain('App');
    } finally {
      await client.close();
      await server.close();
    }
  });
  it('enforces auth, consent scopes, input and output schemas for both transports', async () => {
    await expect(
      executeTool(
        { ...tool, permissions: { requiresAuth: true } },
        { value: 'x' },
        context
      )
    ).rejects.toThrow('Authentication');
    await expect(
      executeTool(
        { ...tool, permissions: { requiresAuth: true } },
        { value: 'x' },
        { ...context, auth: { type: 'anonymous' } }
      )
    ).rejects.toThrow('Authentication');
    const protectedTool = {
      ...tool,
      permissions: { requiresConsent: true, consentScopes: ['personalData' as const] }
    };
    await expect(executeTool(protectedTool, { value: 'x' }, context)).rejects.toThrow(
      'Consent'
    );
    await expect(
      executeTool(
        protectedTool,
        { value: 'x' },
        { ...context, consent: { scopes: ['analytics'], acceptedAt: 'now' } }
      )
    ).rejects.toThrow('Consent');
    await expect(
      executeTool(
        protectedTool,
        { value: 'x' },
        { ...context, consent: { scopes: ['personalData'], acceptedAt: 'now' } }
      )
    ).resolves.toEqual({ value: 'x' });
    await expect(
      executeTool(
        { ...tool, handler: async () => ({ invalid: true }) },
        { value: 'x' },
        context
      )
    ).rejects.toThrow();
  });
  it('carries session and consent metadata without accepting client-supplied authentication', async () => {
    const protectedTool = {
      ...tool,
      widget: undefined,
      permissions: { requiresAuth: true }
    };
    const server = createMcpServer(
      { name: 'test', version: '1', tools: [protectedTool] },
      context
    );
    const client = new Client({ name: 'test', version: '1' });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await server.connect(a);
    await client.connect(b);
    try {
      const result = await client.callTool({
        name: 'echo',
        arguments: { value: 'x' },
        _meta: { 'conversokit/context': { auth: { type: 'jwt' }, sessionId: 'other' } }
      });
      expect(result.isError).toBe(true);
    } finally {
      await client.close();
      await server.close();
    }
  });
});
