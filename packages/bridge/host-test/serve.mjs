// Usage: node packages/bridge/host-test/serve.mjs /absolute/path/from/smoke-scaffolds
import { createServer } from 'vite';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join } from 'node:path';
const work = process.argv[2];
if (!work) throw new Error('Pass the scaffold directory printed by smoke-scaffolds.mjs');
process.env.VERCEL = '1';
process.env.CONVERSOKIT_API_KEYS = '';
process.env.STRIPE_SECRET_KEY = '';
process.env.SUPABASE_URL = '';
process.env.MCP_ALLOWED_ORIGINS = 'http://localhost:5174';
const apps = {};
for (const template of [
  'commerce',
  'booking',
  'saas-onboarding',
  'travel',
  'dashboard'
]) {
  process.env.CONVERSOKIT_WIDGET_HTML = join(
    work,
    template,
    'apps/widget-ui/dist/index.html'
  );
  apps[template] = (
    await import(
      pathToFileURL(join(work, template, 'apps/mcp-server/dist/index.js')).href
    )
  ).default;
}
const server = await createServer({
  root: fileURLToPath(new URL('./', import.meta.url)),
  server: { host: '127.0.0.1', port: 5174, strictPort: true },
  plugins: [
    {
      name: 'scaffold-mcp',
      configureServer(server) {
        for (const [template, app] of Object.entries(apps))
          server.middlewares.use(`/server/${template}`, app);
      }
    }
  ]
});
await server.listen();
server.printUrls();
