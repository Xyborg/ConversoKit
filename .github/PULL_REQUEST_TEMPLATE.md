## Summary

<!-- 1–3 bullets: what this PR changes and why. -->

## Type

- [ ] New widget / integration / template
- [ ] Bug fix
- [ ] Refactor
- [ ] Docs
- [ ] Tooling / CI

## Checklist

- [ ] `pnpm build` passes
- [ ] Types are exported from the package's `src/index.ts`
- [ ] If a new widget collects personal data, `WidgetConfig.permissions` is set (PRD §9, §14)
- [ ] If a new MCP tool, it's registered in `apps/mcp-server/src/tools/index.ts`
- [ ] Docs updated (`docs/`) if user-facing behavior changed

## Test plan

<!-- How a reviewer can verify this. -->
