# ConversoKit

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
git clone https://github.com/Xyborg/ConversoKit
cd ConversoKit
pnpm install
pnpm dev
```

Two services start in parallel:

- **MCP server** → http://localhost:3000 (`apps/mcp-server`)
- **Widget UI** → http://localhost:5173 (`apps/widget-ui`)

Open the widget UI in your browser. It calls the MCP server's `search_products` tool and renders the result with a `ProductCarousel`.

## Repo structure

```
ConversoKit/
├── apps/
│   ├── mcp-server/      # MCP tool server (Express + Zod)
│   └── widget-ui/       # React + Vite widget host
├── packages/
│   ├── widgets/         # Reusable React widgets
│   ├── templates/       # Bootstrap-able app templates
│   ├── integrations/    # Stripe, Supabase, HubSpot, …
│   ├── auth/            # OAuth / JWT / API-key helpers
│   ├── themes/          # Theme tokens
│   └── shared/          # Cross-package types & schemas
├── examples/            # Production-grade demo apps
├── docs/                # Setup & authoring guides
└── scripts/
```

## Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `pnpm dev`        | Run all apps in parallel (turbo)              |
| `pnpm build`      | Build every package + app                     |
| `pnpm lint`       | Lint every package (where wired)              |
| `pnpm test`       | Run tests across the workspace                |
| `pnpm typecheck`  | Type-check every package                      |

Filter to a single workspace:

```bash
pnpm --filter mcp-server dev
pnpm --filter widget-ui dev
pnpm --filter @conversokit/widgets dev
```

## Adding things

- **MCP tool** → new file in `apps/mcp-server/src/tools/`, append to the `tools` array in `tools/index.ts`. Tool shape: `{ name, description, inputSchema, outputSchema, handler }` (Zod schemas).
- **Widget** → new component in `packages/widgets/src/`, export from `src/index.ts`.
- **Template** → new factory in `packages/templates/src/index.ts` returning an `AppTemplate`. Tools and widgets are referenced **by name**, not by import.
- **Integration** → new file in `packages/integrations/src/` exporting an interface + at least one implementation.

See `docs/setup.md` for the full setup guide and `ChatGPT App Boilerplate Platform - PRD.md` for the product spec.

## Requirements

- Node.js ≥ 18
- pnpm ≥ 8

## License

[Apache 2.0](./LICENSE).
