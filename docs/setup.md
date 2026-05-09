# Setup

Get a local dev environment running.

## Requirements

- Node.js ≥ 18 (Node 20 recommended)
- pnpm ≥ 8

```bash
npm install -g pnpm
```

## Two ways to start

### A — Use the CLI (fastest)

```bash
npx conversokit create my-app --template commerce   # or booking | saas-onboarding | travel | dashboard
cd my-app
pnpm install
pnpm dev
```

### B — Clone the repo (contributor / boilerplate fork)

```bash
git clone https://github.com/Xyborg/ConversoKit
cd ConversoKit
pnpm install
pnpm dev
```

`pnpm dev` runs the MCP server (`:3000`) and widget UI (`:5173`) in parallel via Turborepo.

## Environment

Copy `.env.example` to `.env`. The defaults work for the local demo:

- `PORT=3000` — MCP server port.
- Auth and integrations are commented out — uncomment and fill the keys you actually use.

## Common scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Run all apps in parallel |
| `pnpm build` | Build every package + app |
| `pnpm typecheck` | TS check across the workspace |
| `pnpm test` | Vitest smoke tests |
| `pnpm lint` | ESLint over every package |
| `pnpm --filter mcp-server dev` | Just the server |
| `pnpm --filter widget-ui dev` | Just the UI |

## Troubleshooting

- **Corepack signature error on first `pnpm install`** — known Node 24+/Corepack issue. Set `COREPACK_INTEGRITY_KEYS=0` and rerun, or install pnpm via `npm install -g pnpm@9`.
- **`@conversokit/*` modules not found** — run `pnpm install` at the repo root, not inside one app.
- **MCP tool call returns 401** — `CONVERSOKIT_API_KEYS` is set; either unset it for dev or send `Authorization: Bearer <key>` from your bridge.
- **MCP tool call returns 412** — the tool requires consent. Send the `x-conversokit-consent` header (the bridge does this automatically when configured).
