# Widget authoring

How to build a new widget that fits into ConversoKit's contract.

## Anatomy of a widget

Every widget is a React component plus a small metadata object so templates and the CLI can resolve it by name.

```tsx
// packages/widgets/src/MyCard.tsx
import React from 'react';
import { z } from 'zod';
import { defaultWidgetConfig, type WidgetMeta } from '@conversokit/shared';

export interface MyCardProps {
  title: string;
  onAction?: () => void;
}

export const MyCard: React.FC<MyCardProps> = ({ title, onAction }) => (
  <div
    style={{
      backgroundColor: 'var(--ck-surface)',
      color: 'var(--ck-text)',
      border: '1px solid var(--ck-border)',
      borderRadius: 'var(--ck-radius-md)',
      padding: 'var(--ck-spacing-4)'
    }}
  >
    <h3 style={{ margin: 0 }}>{title}</h3>
    {onAction && (
      <button onClick={onAction} style={{ marginTop: 'var(--ck-spacing-2)' }}>
        Continue
      </button>
    )}
  </div>
);

export const myCardSchema = z.object({ title: z.string() });

export const MyCardMeta: WidgetMeta = {
  name: 'MyCard',
  category: 'core',
  version: '0.1.0',
  config: { ...defaultWidgetConfig, permissions: {} },
  schema: myCardSchema
};
```

## Rules

1. **Use CSS variables** (`var(--ck-primary)`, `var(--ck-radius-md)`, etc.) — never hardcoded colors. Themes inject these via `<ThemeProvider>`.
2. **Define a Zod schema** (`<Widget>Schema`) that lives in `@conversokit/shared` if the same shape is needed by an MCP tool. Otherwise local is fine.
3. **Export `<Widget>Meta`** — a `WidgetMeta` with name (PascalCase), category, version, config, schema. Used by the registry, CLI, and template manifests.
4. **Register** it in `packages/widgets/src/registry.ts`.
5. **Re-export** from `packages/widgets/src/index.ts`.
6. **Add a smoke test** in `packages/widgets/src/__tests__/widgets.test.tsx`.

## Permissions and consent

If the widget collects personal data:

```ts
config: {
  ...defaultWidgetConfig,
  permissions: { collectPersonalData: true, requiresConsent: true }
}
```

The host app must wrap the widget in `<ConsentBanner scopes={['personalData']}>` and the corresponding MCP tool must declare `permissions.requiresConsent: true`.

## Using existing tokens

| Token | Use for |
| --- | --- |
| `--ck-primary`, `--ck-primary-foreground` | Primary CTA backgrounds + text |
| `--ck-surface` | Card / sheet backgrounds |
| `--ck-background` | Page background |
| `--ck-text`, `--ck-muted` | Body / secondary text |
| `--ck-border` | Borders, dividers |
| `--ck-accent`, `--ck-success`, `--ck-danger` | Status colors |
| `--ck-radius-{sm,md,lg}` | Border radii |
| `--ck-spacing-{1..8}` | Padding/margin |
| `--ck-font-family`, `--ck-font-size-{sm,base,lg,xl}` | Typography |

Adding a new token? Update `Theme` in `packages/themes/src/index.ts` and the mapping in `packages/themes/src/css.ts`.

## Don't do this

- Inline color literals (`#6366f1`) — use a token.
- `position: fixed` overlays without `aria-live` / `role="dialog"` — accessibility regressions.
- Importing from `apps/*` — widgets must be app-agnostic.
- Pulling in heavy dependencies (chart libs, drag-and-drop) without justification — keep the bundle under 200 KB gz.
