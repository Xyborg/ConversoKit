# Contributing to ConversoKit

Thanks for your interest. This guide is intentionally short — start here, then read [`CLAUDE.md`](./CLAUDE.md) for the architecture deep-dive.

## Dev setup

```bash
git clone https://github.com/Xyborg/ConversoKit
cd ConversoKit
pnpm install     # Node ≥18, pnpm ≥8
pnpm dev         # MCP server :3000 + widget UI :5173 in parallel
```

If `pnpm install` fails with a Corepack signature error on Node 24+, prefix the command with `COREPACK_INTEGRITY_KEYS=0`.

Common scripts:

| Command           | What it does                                 |
| ----------------- | -------------------------------------------- |
| `pnpm typecheck`  | Type-check every workspace package           |
| `pnpm test`       | Vitest across packages that have tests       |
| `pnpm lint`       | ESLint over every package                    |
| `pnpm build`      | Build every package + app via turbo          |

## Adding things

- **MCP tool** → new file in `apps/mcp-server/src/tools/<name>.ts` exporting `defineTool({ name, description, inputSchema, outputSchema, permissions, handler })`. Append it to the `tools: Tool[]` array in `apps/mcp-server/src/tools/index.ts`. If it touches personal data, set `permissions.requiresConsent: true`.
- **Widget** → new component in `packages/widgets/src/<Name>.tsx`. Export `<Name>Meta: WidgetMeta` and add it to `widgetRegistry` in `packages/widgets/src/registry.ts`. Style only via `var(--ck-*)` tokens — no inline color literals.
- **Template** → new factory in `packages/templates/src/<name>.ts`, exported from `index.ts`. Reference tools and widgets **by string name**, not import.
- **Integration** → new file in `packages/integrations/src/<domain>.ts`. Provide an interface, a real provider, a Mock fallback, and a `create<Provider>(env)` factory that returns `null` when env is missing.

## Commit style

Follow the existing pattern in `git log` — phase-prefixed, one-line summary in the title, longer body explaining what shipped and why:

```
Phase 7.7: ship readiness — lint, docs, runnable examples, publish setup
```

For bug fixes outside a phase:

```
fix(integrations): HubSpot 409 PATCH path correctly upserts on email conflict
```

## Tests

Where they exist, tests live under `src/__tests__/*.test.ts(x)` per package. `vitest run` is the default; `--passWithNoTests` keeps green for packages without tests yet.

## Filing issues / PRs

- Bug reports → use the `bug_report.md` template under `.github/ISSUE_TEMPLATE/`.
- Feature requests → `feature_request.md`.
- PRs → describe the user-visible change, the test plan you ran, and any PRD section it advances.

## License

Apache 2.0. By contributing you agree that your contributions are licensed under the same terms.
