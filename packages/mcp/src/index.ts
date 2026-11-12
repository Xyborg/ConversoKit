import { randomUUID } from 'node:crypto';
import { Router, type Request } from 'express';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  RESOURCE_MIME_TYPE,
  registerAppResource
} from '@modelcontextprotocol/ext-apps/server';
import { consentRecordSchema, type Tool, type ToolContext } from '@conversokit/shared';

export interface WidgetResource {
  uri: string;
  name: string;
  /** Read on demand so development rebuilds do not require a server restart. */
  html: () => string | Promise<string>;
  csp?: {
    connectDomains?: string[];
    resourceDomains?: string[];
    frameDomains?: string[];
  };
}
export interface McpOptions {
  name: string;
  version: string;
  tools: Tool[];
  widgets?: WidgetResource[];
  context?: (req: Request) => ToolContext | Promise<ToolContext>;
  /** Browser origins allowed to POST; requests without Origin (MCP clients) are accepted. */
  allowedOrigins?: string[];
}
export class ToolExecutionError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

/** Shared by MCP and REST; annotations never replace these permission checks. */
export async function executeTool(tool: Tool, input: unknown, ctx: ToolContext) {
  if (tool.permissions.requiresAuth && (!ctx.auth || ctx.auth.type === 'anonymous')) {
    throw new ToolExecutionError('Authentication required for this tool', 401);
  }
  if (tool.permissions.requiresConsent) {
    const record = consentRecordSchema.safeParse(ctx.consent);
    if (
      !record.success ||
      !record.data.scopes.length ||
      tool.permissions.consentScopes?.some((scope) => !record.data.scopes.includes(scope))
    ) {
      throw new ToolExecutionError('Consent required for this tool', 412);
    }
  }
  const output = await tool.handler(tool.inputSchema.parse(input), ctx);
  return tool.outputSchema.parse(output);
}

const clientContextSchema = z.object({
  sessionId: z.string().min(1).max(200).optional(),
  consent: consentRecordSchema.optional()
});
function withClientContext(ctx: ToolContext, metadata: unknown): ToolContext {
  const parsed = clientContextSchema.safeParse(metadata);
  if (!parsed.success) return ctx;
  // Client metadata is only a correlation ID and a consent assertion, never identity/auth.
  return {
    ...ctx,
    sessionId: parsed.data.sessionId ?? ctx.sessionId,
    consent: ctx.consent ?? parsed.data.consent
  };
}

export function createMcpServer(options: McpOptions, context: ToolContext) {
  const server = new McpServer({ name: options.name, version: options.version });
  const resources = new Set(options.widgets?.map((w) => w.uri));
  for (const widget of options.widgets ?? []) {
    registerAppResource(server, widget.name, widget.uri, {}, async () => ({
      contents: [
        {
          uri: widget.uri,
          mimeType: RESOURCE_MIME_TYPE,
          text: await widget.html(),
          _meta: { ui: { csp: widget.csp ?? {} } }
        }
      ]
    }));
  }
  for (const tool of options.tools) {
    if (
      !(tool.inputSchema instanceof z.ZodObject) ||
      !(tool.outputSchema instanceof z.ZodObject)
    ) {
      throw new Error(`MCP tool ${tool.name} must have object input and output schemas`);
    }
    if (tool.widget && !resources.has(tool.widget))
      throw new Error(`Missing widget resource: ${tool.widget}`);
    server.registerTool(
      tool.name,
      {
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        annotations: tool.annotations,
        ...(tool.widget
          ? {
              _meta: {
                ui: { resourceUri: tool.widget },
                'openai/outputTemplate': tool.widget
              }
            }
          : {})
      },
      async (input, extra) => {
        try {
          const ctx = withClientContext(context, extra._meta?.['conversokit/context']);
          const output = (await executeTool(tool, input, ctx)) as Record<string, unknown>;
          return {
            structuredContent: output,
            content: [{ type: 'text' as const, text: JSON.stringify(output) }],
            _meta: { 'conversokit/toolName': tool.name }
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: 'text' as const,
                text: error instanceof Error ? error.message : 'Tool execution failed'
              }
            ]
          };
        }
      }
    );
  }
  return server;
}

/** Stateless transport: one server per request, no shared authentication/context. */
export function createMcpRouter(options: McpOptions): Router {
  const router = Router();
  router.all('/mcp', async (req, res) => {
    const origin = req.header('origin');
    if (origin && !(options.allowedOrigins ?? []).includes(origin)) {
      res.status(403).json({ error: 'Origin not allowed' });
      return;
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res
        .status(405)
        .json({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32000, message: 'Method not allowed' }
        });
      return;
    }
    let server: McpServer | undefined;
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    res.on('close', () => {
      void transport.close();
      void server?.close();
    });
    try {
      const context = (await options.context?.(req)) ?? {
        sessionId: randomUUID(),
        logger: console
      };
      server = createMcpServer(options, context);
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error('MCP request failed', error);
      if (!res.headersSent)
        res
          .status(500)
          .json({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: 'Internal server error' }
          });
    }
  });
  return router;
}
