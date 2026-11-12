# MCP basics

ConversoKit exposes MCP JSON-RPC over Streamable HTTP at `/mcp`. The official SDK handles initialization and protocol negotiation. REST endpoints remain available for standalone local widget development.

```mermaid
sequenceDiagram
    participant Host as ChatGPT / MCP Apps host
    participant Server as POST /mcp
    participant Widget as React iframe
    Host->>Server: initialize, tools/list
    Host->>Server: tools/call (show_app)
    Server-->>Host: structuredContent + UI resource metadata
    Host->>Server: resources/read (ui://conversokit/app-v1.html)
    Server-->>Host: text/html;profile=mcp-app
    Host->>Widget: load HTML
    Widget->>Host: ui/initialize
    Host-->>Widget: capabilities + tool result
    Widget->>Host: tools/call (business tool)
    Host->>Server: tools/call
    Server-->>Host: validated result
    Host-->>Widget: structuredContent
```

## Define tools

```ts
import { z } from 'zod';
import { defineTool } from '@conversokit/shared';

export const searchTool = defineTool({
  name: 'search_products',
  description: 'Search the product catalog.',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ items: z.array(z.string()) }),
  permissions: { requiresAuth: false },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  async handler(input, ctx) {
    ctx.logger.info('Searching products');
    return { items: [input.query] };
  }
});
```

Add tools to `apps/mcp-server/src/tools/index.ts`. The MCP adapter currently requires **Zod object input and output schemas**, validates both, and returns `structuredContent` plus a text representation for clients without UI. Tool failures return MCP `isError`; REST uses HTTP status codes. Set annotations explicitly; they describe behavior and do not grant permissions.

## Widgets and resources

Each template registers `show_app`, a read-only tool that opens its UI without submitting data. Business tools remain usable independently. To attach a widget to another tool, set `widget: 'ui://conversokit/app-v1.html'`; consume host-supplied data with `useToolOutput()` instead of refetching and overwriting it.

`createMcpRouter` registers HTML resources and both `_meta.ui.resourceUri` and the ChatGPT compatibility alias `openai/outputTemplate`. Resources use `text/html;profile=mcp-app`. Vite builds a single HTML file containing JS/CSS. Change the resource URI when publishing a breaking widget change. Declare only the external asset/API domains actually required in the resource's CSP.

## Calling from React

Wrap the app in `BridgeProvider`. Inside a host iframe the bridge uses `App.connect()` even if `window.openai` is present. It receives MCP tool notifications and supports `window.openai.toolOutput` for compatibility.

```tsx
const bridge = useBridge();
const result = await bridge.callTool('search_products', { query: 'bottle' });
await bridge.openLink('https://example.com/checkout');
```

`callTool` returns the unwrapped structured output, matching REST. `openLink` uses the host's link API. Top-level standalone pages use REST at `baseUrl`; set `mode="local"` explicitly for standalone previews embedded in an unrelated iframe. Failed MCP initialization never silently sends requests to localhost.

## Authentication, consent and sessions

Both transports use `executeTool` for input/output validation and permissions:

- `requiresAuth` requires a verified, non-anonymous server context. API keys are configured on the server and supplied by the connector. Do not embed server credentials in widget HTML. Existing OAuth login routes are not a complete MCP OAuth authorization server; providers requiring OAuth discovery need that integration separately.
- `requiresConsent` requires an accepted consent record; `consentScopes` specifies the required scopes. `ConsentBanner` records explicit acceptance and forwards it to the bridge, including in iframes where storage is unavailable. REST carries this in `x-conversokit-consent`; MCP carries it in `_meta['conversokit/context']`.
- Consent metadata is a client assertion, not proof of identity or an authorization token. A direct model call without consent is rejected; use the widget's consent flow or a server-side consent store. `permissions.scopes` and `rateLimit` remain application metadata; configure authorization scopes and rate limiting in your deployment.
- A bridge instance generates a correlation `sessionId` for carts/drafts and forwards it on each call. It is not the MCP transport session and is not an authenticated identity. Independent model calls do not automatically share the widget's session. For production, key private records by a verified user and persist them in your database. Reloading the widget creates a new anonymous session.

The transport is stateless and does not expose an SSE subscription: GET and DELETE `/mcp` return 405. Browser requests with an Origin must match `MCP_ALLOWED_ORIGINS`; non-browser MCP requests without Origin are accepted. Keep this allowlist narrow and apply your normal ingress/host validation.

See [deployment](deployment.md) for connecting hosts and [the official UI guide](https://developers.openai.com/plugins/build/chatgpt-ui) for MCP Apps behavior.
