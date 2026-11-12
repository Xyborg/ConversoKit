# @conversokit/bridge

MCP Apps bridge for ConversoKit React widgets. Hosted iframes initialize the standard MCP Apps protocol; standalone pages use the local REST development server.

```tsx
import { BridgeProvider, useBridge, useToolOutput } from '@conversokit/bridge';

// Wrap your React tree:
<BridgeProvider baseUrl="http://localhost:3000">
  <App />
</BridgeProvider>;

// Inside a child component:
const bridge = useBridge();
const initialResult = useToolOutput();
const result = await bridge.callTool('search_products', { query: '' });
await bridge.openLink('https://example.com/checkout');
```

`callTool` unwraps MCP `structuredContent` and throws on tool errors. The provider manages initialization and cleanup. `useToolOutput` receives model-initiated results; `window.openai.toolOutput` is supported for compatibility. MCP Apps remains primary even when `window.openai` exists.

Options include `baseUrl`, `mode` (`auto`, `mcp`, `local`), `consent`, `sessionId`, and a local-development `apiKey`. Use `mode="local"` for non-MCP embedded previews. Never embed server API keys in a hosted widget. `ConsentBanner` acceptance is forwarded automatically; `bridge.setConsent(record)` supports custom consent UIs. A correlation session ID is not authentication.

For non-React usage call `bridge.connect()` and `bridge.close()` yourself. See [MCP basics](https://github.com/Xyborg/ConversoKit/blob/main/docs/mcp-basics.md).
