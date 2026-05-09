# @conversokit/bridge

Widget Bridge for ConversoKit — `<BridgeProvider>` + `useBridge()` that prefers `window.openai.callTool` and falls back to `fetch` for local dev.

Part of [ConversoKit](https://github.com/Xyborg/ConversoKit) — a boilerplate for building ChatGPT Apps (Apps SDK / MCP) in <30 minutes.

## Install

```bash
pnpm add @conversokit/bridge react
# or
npm install @conversokit/bridge react
```

## Usage

```tsx
import { BridgeProvider, useBridge } from '@conversokit/bridge';

export function App() {
  return (
    <BridgeProvider baseUrl="http://localhost:3000">
      <Search />
    </BridgeProvider>
  );
}

function Search() {
  const bridge = useBridge();
  const onSearch = async (query: string) => {
    const { products } = await bridge.callTool('search_products', { query });
  };
}
```

Inside ChatGPT, the bridge calls `window.openai.callTool` directly. Outside (local dev, Storybook), it falls back to `fetch(<baseUrl>/tools/<name>)`.

## Documentation

Full docs and runnable examples live in the [main repo](https://github.com/Xyborg/ConversoKit#readme).

## License

Apache-2.0 © Martín Aberastegue
