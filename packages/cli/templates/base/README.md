# <% projectName %>

A ChatGPT App built with [ConversoKit](https://github.com/Xyborg/ConversoKit).
Template: **<% template %>**

## Quick start

```bash
pnpm install
pnpm dev
```

- MCP server → http://localhost:3000/mcp
- Widget UI → http://localhost:5173

## Structure

```
<% projectName %>/
├── apps/
│   ├── mcp-server/   # Express + Zod MCP tool server
│   └── widget-ui/    # Vite + React widget host
├── .env.example
└── package.json
```

## Customise

- Add tools under `apps/mcp-server/src/tools/`, then register them in
  `tools/index.ts`.
- Add or fork widgets in `apps/widget-ui/src/widgets/`.
- See ConversoKit docs for widget authoring, integrations, and compliance.

## Environment

Export the variables in `.env.example` in your shell, or configure them in your hosting platform. The server does not automatically load `.env`. Requires Node 20+ and pnpm 9.

## Connect to a host

Expose port 3000 over HTTPS and add `https://<host>/mcp` as a custom connector in ChatGPT or an MCP Apps-capable Claude client. Ask the host to call `show_app`. Test discovery first with `npx @modelcontextprotocol/inspector` (Streamable HTTP).

`pnpm dev` builds the single-file widget and watches it for changes. `pnpm build && pnpm start` runs the production build. Deploy the server together with `apps/widget-ui/dist/index.html`.

API keys belong on the server and in the connector authentication, never in widget HTML. Consent is requested in the UI before personal-data actions. Demo integrations and anonymous session stores need production configuration; see the repository's deployment documentation.
