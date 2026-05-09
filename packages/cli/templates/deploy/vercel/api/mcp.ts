// Vercel serverless adapter for the ConversoKit MCP server.
// Re-exports the express app from `apps/mcp-server` so all routes (/tools,
// /auth, /webhooks, /userdata, /admin, /health) are answered by one function.
//
// Make sure `apps/mcp-server/src/index.ts` exports the app:
//   export { app };
// then this file imports it as `app`.
import app from '../apps/mcp-server/dist/index.js';

export default app;
