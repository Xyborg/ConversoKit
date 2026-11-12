# @conversokit/mcp

Express adapter for ConversoKit tools using the official MCP SDK and MCP Apps HTML resources. Requires Node 20+.

```ts
import { createMcpRouter } from '@conversokit/mcp';
app.use(express.json());
app.use(
  createMcpRouter({
    name: 'my-app',
    version: '1.0.0',
    tools,
    context: buildVerifiedContext,
    widgets: [{ uri: 'ui://my-app/v1.html', name: 'My app', html: readWidgetHtml }]
  })
);
```

Provides stateless Streamable HTTP at `/mcp`, MCP tools/resources and validated structured output. Set a tool's `widget` URI to associate it with a registered resource. Object input/output schemas are required. `executeTool` is exported so REST handlers use the same permission and schema checks.

Only pass verified authentication in the server context. Client metadata can carry a correlation ID and explicit consent assertion, never authentication. Configure `allowedOrigins` for browser MCP clients; requests with no Origin are accepted. GET/DELETE return 405 (no SSE session).

See [MCP basics](../../docs/mcp-basics.md) and [deployment](../../docs/deployment.md).

## Regression checks

From the repository root:

```sh
pnpm build
node packages/mcp/scripts/smoke-scaffolds.mjs
```

The smoke check packs the public packages, installs the packed CLI in a temporary directory, generates all five templates, installs/builds/typechecks each, and exercises every tool and resource through the official HTTP client. Local tarball overrides let this run before publishing. It also checks `pnpm dev`. It requires npm registry access and local ports 33100–33104 and 33200.

For a browser check, pass the temporary directory printed by the script to:

```sh
node packages/bridge/host-test/serve.mjs /absolute/path/to/generated-scaffolds
```

Open `http://localhost:5174`. This is a local test host using the official `AppBridge`, not a ChatGPT or Claude account test. Its iframe denies same-origin storage, and checkout links are logged rather than opened. Only use disposable generated demos with mock providers.
