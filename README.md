# ConversoKit :: Build Apps for ChatGPT

**ConversoKit** is the open-source framework for **production-ready ChatGPT Apps**. Compose 19 themed widgets, 16 MCP tools, and 5 templates, and ship in under 30 minutes.

> **Latest:** v0.1.1 — see [CHANGELOG.md](./CHANGELOG.md).

Build production applications using the OpenAI Apps SDK and MCP.

Includes:

- Reusable widgets
- Commerce flows
- Booking flows
- Lead generation
- Templates
- Integrations
- MCP server starter
- React widget system

## Quick start

```bash
npx conversokit create my-app --template commerce
cd my-app
pnpm install
pnpm dev
```

Templates: `commerce`, `booking`, `saas-onboarding`, `travel`, `dashboard`.

Two services start in parallel:

- **MCP server** → http://localhost:3000 (`GET /health` is unauthenticated)
- **Widget UI** → http://localhost:5173

## Or fork the repo

```bash
git clone https://github.com/Xyborg/ConversoKit
cd ConversoKit
pnpm install
pnpm dev
```

The dev demo cycles through Commerce / Booking / Lead Gen / Travel / Dashboard tabs. Switch between 7 themes from the header.

## Architecture

### Data flow

ChatGPT and compatible MCP Apps hosts connect to `/mcp` using Streamable HTTP. The `show_app` tool opens a registered HTML widget; the widget initializes MCP Apps and calls business tools through the host. Standalone local previews retain REST support.

```mermaid
flowchart LR
    Host["ChatGPT / MCP Apps host"] <-->|"JSON-RPC /mcp"| MCP["@conversokit/mcp"]
    Widgets["React widget"] <-->|"MCP Apps bridge"| Host
    MCP --> Tools["defineTool + Zod + permission checks"]
    Tools --> Integrations["Stores and integrations"]
```

### Package graph

The 9 publishable packages compose around `@conversokit/shared` (schemas/types). Templates pull widgets + integrations; widgets pull themes; auth and the CLI stand alone.

```mermaid
flowchart TD
    shared["@conversokit/shared"]
    themes["@conversokit/themes"]
    bridge["@conversokit/bridge"]
    auth["@conversokit/auth"]
    widgets["@conversokit/widgets"]
    integrations["@conversokit/integrations"]
    templates["@conversokit/templates"]
    cli["conversokit (CLI)"]

    mcp["@conversokit/mcp"] --> shared
    bridge --> shared
    widgets --> shared
    widgets --> themes
    integrations --> shared
    templates --> shared
    templates --> widgets
    templates --> integrations
```

### Request lifecycle

The host initializes MCP, discovers tools, calls `show_app`, and reads its HTML resource. The iframe completes `ui/initialize` before calling tools. Data tools return `structuredContent` plus model-readable text. See [MCP basics](docs/mcp-basics.md) and [Connect to ChatGPT / Claude](docs/deployment.md).

## Repo structure

```
ConversoKit/
├── apps/
│   ├── mcp-server/      # Streamable HTTP MCP server (16 business tools + show_app, /health, /auth/:provider/*)
│   └── widget-ui/       # Vite + React widget host
├── packages/
│   ├── widgets/         # 19 reusable React widgets (CSS-vars themed)
│   ├── bridge/          # window.openai + fetch fallback
│   ├── templates/       # commerce / booking / saas-onboarding / travel / dashboard
│   ├── integrations/    # Payments: Stripe (real) + Mock
│   │                    # CRM: HubSpot (real) + Mock
│   │                    # Email: Resend (real) + Cloudflare Email (real) + Mock
│   │                    # Stores: Supabase (real) + InMemory
│   ├── auth/            # API key, JWT (HS256/JWKS via jose), anonymous,
│   │                    # OAuth (Google, GitHub, Microsoft, Auth0),
│   │                    # JWT-verify (Clerk JWKS, Supabase Auth)
│   ├── themes/          # 7 themes + ThemeProvider
│   ├── shared/          # Zod schemas, tool/widget contracts, mocks, compliance types
│   └── cli/             # `npx conversokit create | add | deploy`
├── examples/            # Per-template runnable references + roadmap stubs
├── docs/                # Setup, deployment, MCP basics, widget authoring,
│                        # integrations, compliance, app-review checklist
└── scripts/
```

## Packages

Each package ships standalone on npm — install only what you need.

| Package                                                          | npm                                                            | Purpose                                           |
| ---------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| [`@conversokit/shared`](./packages/shared/README.md)             | [npm](https://www.npmjs.com/package/@conversokit/shared)       | Zod schemas, tool/widget contracts, mocks         |
| [`@conversokit/themes`](./packages/themes/README.md)             | [npm](https://www.npmjs.com/package/@conversokit/themes)       | 7 themes + `<ThemeProvider>`                      |
| [`@conversokit/widgets`](./packages/widgets/README.md)           | [npm](https://www.npmjs.com/package/@conversokit/widgets)      | 19 React widgets                                  |
| [`@conversokit/bridge`](./packages/bridge/README.md)             | [npm](https://www.npmjs.com/package/@conversokit/bridge)       | MCP Apps handshake + local REST fallback          |
| [`@conversokit/mcp`](./packages/mcp/README.md)                   | Next release                                                   | Streamable HTTP tools + widget resources          |
| [`@conversokit/auth`](./packages/auth/README.md)                 | [npm](https://www.npmjs.com/package/@conversokit/auth)         | API key, JWT, OAuth providers, Express middleware |
| [`@conversokit/integrations`](./packages/integrations/README.md) | [npm](https://www.npmjs.com/package/@conversokit/integrations) | Stripe, HubSpot, Resend, Supabase                 |
| [`@conversokit/templates`](./packages/templates/README.md)       | [npm](https://www.npmjs.com/package/@conversokit/templates)    | App scaffolds (commerce, booking, …)              |
| [`conversokit`](./packages/cli/README.md)                        | [npm](https://www.npmjs.com/package/conversokit)               | `npx conversokit create / add / deploy`           |

## Scripts

| Command          | What it does                     |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Run all apps in parallel (turbo) |
| `pnpm build`     | Build every package + app        |
| `pnpm typecheck` | Type-check every package         |
| `pnpm test`      | Vitest smoke tests               |
| `pnpm lint`      | ESLint over every package        |

Filter to a single workspace:

```bash
pnpm --filter mcp-server dev
pnpm --filter widget-ui dev
pnpm --filter @conversokit/widgets dev
```

## Adding things

- **MCP tool** → new file in `apps/mcp-server/src/tools/`, append to the `tools` array in `tools/index.ts`. Tool shape: `defineTool({ name, description, inputSchema, outputSchema, permissions, handler })`.
- **Widget** → new component in `packages/widgets/src/`, export `<Name>Meta` + register in `registry.ts`.
- **Template** → new factory in `packages/templates/src/`, exported from `index.ts`. Tools and widgets are referenced **by name**.
- **Integration** → new file in `packages/integrations/src/` exporting an interface + a real impl + a mock fallback.

## Deploy

```bash
npx conversokit deploy vercel    # writes vercel.json + api/mcp.ts
npx conversokit deploy docker    # writes Dockerfile + docker-compose.yml
npx conversokit deploy railway   # writes railway.json + Procfile
```

Re-run with `--force` to overwrite. Each command prints the next-step CLI commands for that target. See [`docs/deployment.md`](./docs/deployment.md).

## Documentation

- [Setup](./docs/setup.md)
- [MCP basics](./docs/mcp-basics.md)
- [Widget authoring](./docs/widget-authoring.md)
- [Integrations](./docs/integrations.md)
- [Compliance](./docs/compliance.md)
- [Deployment](./docs/deployment.md)
- [App-review checklist](./docs/app-review-checklist.md)

### Learn more

- [OpenAI Apps SDK](https://platform.openai.com/docs/apps-sdk) — the host runtime ConversoKit targets
- [Model Context Protocol](https://modelcontextprotocol.io) — the tool-calling protocol underneath
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — reference implementation
- [Apps SDK examples](https://github.com/openai/apps-sdk-examples) — OpenAI's first-party samples

## Requirements

- Node.js ≥ 18
- pnpm ≥ 8

## License

[Apache 2.0](./LICENSE).
