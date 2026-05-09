# @conversokit/themes

Themes for ConversoKit (light, dark, minimal, modern-saas, enterprise, commerce, travel) — `<ThemeProvider>` injecting `--ck-*` CSS variables.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

```bash
pnpm add @conversokit/themes react
# or
npm install @conversokit/themes react
```

## Usage

```tsx
import { ThemeProvider, themes } from '@conversokit/themes';

export function App() {
  return (
    <ThemeProvider theme={themes['modern-saas']}>
      <YourWidgets />
    </ThemeProvider>
  );
}
```

All ConversoKit widgets read from `--ck-*` CSS variables, so wrapping them in a `<ThemeProvider>` is enough to restyle the entire surface. Use `themeToCssVars(theme)` if you want to inject tokens without React.

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
