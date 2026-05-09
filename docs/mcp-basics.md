# MCP basics

ConversoKit speaks the OpenAI Apps SDK / MCP shape. This page is a one-page primer on how a tool flows from definition to ChatGPT.

## What is a "tool"?

A tool is a JSON-shaped capability your MCP server exposes:

```ts
import { z } from 'zod';
import { defineTool } from '@conversokit/shared';

export const searchProductsTool = defineTool({
  name: 'search_products',
  description: 'Search the catalog by free text.',
  inputSchema: z.object({ query: z.string(), limit: z.number().optional() }),
  outputSchema: z.object({ items: z.array(productSchema) }),
  permissions: { requiresAuth: false, requiresConsent: false },
  async handler(input, ctx) {
    return { items: [...] };
  }
});
```

Tools live in `apps/mcp-server/src/tools/<toolName>.ts` and are registered by appending to `tools/index.ts`.

## How ChatGPT reaches a tool

```
ChatGPT host  ──►  window.openai.callTool(name, input)
                         │
                         ▼
                  @conversokit/bridge        (in dev: fallback fetch)
                         │
                         ▼
                  POST /tools/:name          (apps/mcp-server)
                         │
                  ┌──────┴──────┐
              auth check    consent check
                         │
                         ▼
                    handler(input, ctx)
                         │
                         ▼
                       output
```

## The Tool contract (`@conversokit/shared`)

```ts
interface Tool<I, O> {
  name: string;
  description: string;
  inputSchema: ZodType<I>;
  outputSchema: ZodType<O>;
  permissions: {
    requiresAuth?: boolean;
    requiresConsent?: boolean;
    scopes?: string[];
  };
  rateLimit?: { perMinute?: number };
  handler(input: I, ctx: ToolContext): Promise<O>;
}
```

`ToolContext` carries `{ sessionId, userId?, auth?, consent?, logger }`. Use `ctx.sessionId` to scope per-conversation state (carts, drafts).

## Permissions

- **`requiresAuth`** — server returns 401 unless an auth provider succeeds.
- **`requiresConsent`** — server returns 412 unless the request carries an `x-conversokit-consent` JSON header that covers the required scopes (`@conversokit/widgets`'s `<ConsentBanner>` writes this for you).

## Calling tools from a widget

```tsx
import { useBridge } from '@conversokit/bridge';

const Catalog = () => {
  const bridge = useBridge();
  const fetch = async () => {
    const result = await bridge.callTool('search_products', { query: '' });
    // result is typed as the tool's outputSchema
  };
};
```

The bridge prefers `window.openai.callTool` when running inside ChatGPT, falls back to `fetch(<baseUrl>/tools/<name>)` for local dev.

## Adding a new tool — checklist

1. Define the schemas in `@conversokit/shared/schemas/<domain>.ts` (so widgets can share them).
2. Implement the tool in `apps/mcp-server/src/tools/<name>.ts` using `defineTool({...})`.
3. Append it to the `tools` array in `apps/mcp-server/src/tools/index.ts`.
4. If it touches personal data, set `permissions.requiresConsent: true` and document the scopes.
5. Restart the dev server. The new tool appears at `GET /tools` automatically.
