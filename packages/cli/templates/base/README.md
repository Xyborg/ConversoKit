# <% projectName %>

A ChatGPT App built with [ConversoKit](https://github.com/Xyborg/ConversoKit).
Template: **<% template %>**

## Quick start

```bash
pnpm install
pnpm dev
```

- MCP server → http://localhost:3000
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

Copy `.env.example` to `.env` and fill in the keys you need.
