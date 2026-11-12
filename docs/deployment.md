# Deployment and host connection

Use Node **20 or newer** and pnpm 9. Deploy the MCP server together with `apps/widget-ui/dist/index.html`: the server reads this single-file bundle when the host requests the UI resource. A separate static UI host is optional for the standalone REST preview.

## Generated projects

```bash
pnpm install
pnpm dev
# MCP: http://localhost:3000/mcp
# Standalone preview: http://localhost:5173
```

`pnpm dev` builds the widget before starting the server, then watches both. For production use `pnpm build` followed by `pnpm start`. Export environment variables in your shell or configure them on the deployment platform; the generated server does not implicitly load `.env`. Set `VITE_PUBLIC_APP_URL` before building to control checkout success/cancel links.

For the repository demo, run `pnpm build` once, then `pnpm --filter mcp-server dev` and `pnpm --filter widget-ui dev`. Rebuild the widget after changes to update the MCP HTML resource.

## Verify the MCP endpoint

```bash
npx @modelcontextprotocol/inspector
```

Choose Streamable HTTP and connect to `http://localhost:3000/mcp`. Verify tool discovery, call `show_app`, call data tools, and read `ui://conversokit/app-v1.html`. If the Inspector browser/proxy sends an Origin, add its exact origin to `MCP_ALLOWED_ORIGINS` before starting the server. Mutating tools that require consent should fail without a consent record.

## Connect ChatGPT or Claude

Expose the local server through an HTTPS tunnel, for example:

```bash
cloudflared tunnel --url http://localhost:3000
```

Use **`https://<your-tunnel-host>/mcp`**, not `/`, `/tools`, or the Vite preview URL.

In ChatGPT, add a custom MCP server using the current Apps/Plugins developer interface. Configure the connector's authentication to match the server, enable the connection in a chat and ask it to call `show_app`. In Claude, add the same URL through the custom remote connector interface available to your account; use an MCP Apps-capable client to render the widget. UI labels and availability depend on the host/account. Refresh the connector after changing tool definitions.

Verify actual interaction, not just discovery: open commerce, accept consent, load products, add a product and start checkout. Repeat booking, onboarding, travel and dashboard with their generated projects. For checkout the default provider is a **mock** unless configured; a rendered demo does not prove live payments or production storage are ready.

## Deployment configurations

Run these from a generated project root:

```bash
npx conversokit deploy docker
npx conversokit deploy railway
npx conversokit deploy vercel
```

Choose one target; commit the generated lockfile before deployment. Docker and Railway build both apps. The Vercel config routes `/mcp` to the server function and includes the widget HTML in its bundle; deploy from the project root, not `apps/mcp-server` in isolation. `GET /health` is available without authentication. Production deployment to these platforms must be tested with your account and environment.

For the repository demo, build Docker from the repository root with `docker build -f apps/mcp-server/Dockerfile -t conversokit-mcp .`.

## Production configuration

- Configure connector authentication server-side. API-key verification is supported; existing app login providers do not implement MCP OAuth discovery by themselves.
- Replace anonymous in-memory stores with persistent, authenticated storage. Serverless instances do not share in-memory carts or reservations.
- Set the public checkout return URL and configure real integrations, webhook verification and secrets separately. Never put API keys in `VITE_*` variables for hosted widgets.
- Restrict REST CORS, MCP browser origins and ingress hostnames. Declare actual widget resource domains in CSP.
- Add application/platform rate limits and restrict scopes. Tool annotations are descriptive, not authorization.

See [MCP basics](mcp-basics.md) for the transport, consent contract and compatibility behavior, and [OpenAI's quickstart](https://developers.openai.com/plugins/build/app-quickstart) for the current ChatGPT connection flow.
