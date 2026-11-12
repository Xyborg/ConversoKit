// Validate the npm boundary: packed packages, CLI-generated projects, HTTP MCP and all tools.
import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const work = await mkdtemp(join(tmpdir(), 'conversokit-mcp-'));
const packs = join(work, 'packs');
await mkdir(packs);
const overrides = {};
const run = (cmd, args, cwd) => {
  try {
    return execFileSync(cmd, args, { cwd, stdio: 'pipe', timeout: 180000 });
  } catch (e) {
    console.error(e.stdout?.toString(), e.stderr?.toString());
    throw e;
  }
};
for (const folder of await readdir(join(root, 'packages'))) {
  const dir = join(root, 'packages', folder);
  const pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'));
  run('pnpm', ['pack', '--pack-destination', packs], dir);
  const filename = `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`;
  overrides[pkg.name] = `file:${join(packs, filename)}`;
}
const cliDir = join(work, 'cli');
await mkdir(cliDir);
run('tar', ['-xzf', overrides.conversokit.slice(5), '-C', cliDir], root);
const cliManifest = join(cliDir, 'package/package.json');
const cliPkg = JSON.parse(await readFile(cliManifest, 'utf8'));
cliPkg.packageManager = 'pnpm@9.0.0';
await writeFile(cliManifest, JSON.stringify(cliPkg));
// Install packed CLI itself; no source/workspace links.
run('pnpm', ['install', '--prod', '--ignore-scripts'], join(cliDir, 'package'));
const inputs = {
  show_app: {},
  search_products: { query: '', limit: 2 },
  get_cart: {},
  set_cart: { items: [{ id: 'prod_1', title: 'Demo', quantity: 1 }], currency: 'USD' },
  create_checkout: {
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel'
  },
  get_availability: { resourceId: 'demo', from: '2026-11-12', to: '2026-11-13' },
  create_reservation: { resourceId: 'demo', slotId: 'demo', customer: { name: 'Test' } },
  cancel_reservation: { reservationId: 'demo' },
  submit_lead: {
    formId: 'demo',
    values: { email: 'test@example.com', name: 'Test' },
    submittedAt: new Date().toISOString()
  },
  list_destinations: {},
  search_hotels: { query: '' },
  search_flights: { origin: 'BER', destination: 'LON' },
  get_itinerary: { itineraryId: 'demo' },
  get_kpis: {},
  get_trend_series: {},
  get_analytics_panel: {},
  get_alerts: {}
};
for (const [i, template] of [
  'commerce',
  'booking',
  'saas-onboarding',
  'travel',
  'dashboard'
].entries()) {
  const dir = join(work, template);
  run(
    'node',
    [join(cliDir, 'package/dist/cli.js'), 'create', dir, '--template', template],
    work
  );
  const pkgPath = join(dir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  pkg.name = `smoke-${template}`;
  pkg.pnpm = { overrides };
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2));
  // CLI accepts a path; package names should derive from its basename.
  run('pnpm', ['install', '--no-frozen-lockfile'], dir);
  run('pnpm', ['build'], dir);
  run('pnpm', ['exec', 'tsc', '--noEmit'], join(dir, 'apps/widget-ui'));
  const html = await readFile(join(dir, 'apps/widget-ui/dist/index.html'), 'utf8');
  assert(!/<script[^>]+src=/.test(html), 'Widget must be self-contained');
  const port = 33100 + i;
  const child = spawn(process.execPath, ['apps/mcp-server/dist/index.js'], {
    cwd: dir,
    env: {
      ...process.env,
      PORT: String(port),
      CONVERSOKIT_API_KEYS: '',
      STRIPE_SECRET_KEY: '',
      SUPABASE_URL: '',
      VERCEL: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let logs = '';
  child.stdout.on('data', (d) => (logs += d));
  child.stderr.on('data', (d) => (logs += d));
  const url = `http://127.0.0.1:${port}`;
  const client = new Client({ name: 'scaffold-smoke', version: '1' });
  try {
    for (let n = 0; n < 100; n++) {
      try {
        if ((await fetch(url + '/health')).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    await client.connect(new StreamableHTTPClientTransport(new URL(url + '/mcp')));
    const { tools } = await client.listTools();
    assert(tools.some((t) => t.name === 'show_app'));
    for (const tool of tools) {
      assert(inputs[tool.name], `Missing test input: ${tool.name}`);
      assert.equal(typeof tool.annotations?.readOnlyHint, 'boolean');
      const result = await client.callTool({
        name: tool.name,
        arguments: inputs[tool.name],
        _meta: {
          'conversokit/context': {
            sessionId: 'smoke-cart',
            consent: {
              scopes: ['personalData', 'marketing'],
              acceptedAt: new Date().toISOString()
            }
          }
        }
      });
      assert(!result.isError, `${template}/${tool.name}: ${JSON.stringify(result)}`);
      assert(result.structuredContent);
    }
    if (template === 'commerce') {
      const denied = await client.callTool({
        name: 'create_checkout',
        arguments: inputs.create_checkout
      });
      assert(denied.isError, 'Checkout must require consent');
      const cart = await client.callTool({
        name: 'get_cart',
        arguments: {},
        _meta: { 'conversokit/context': { sessionId: 'other-session' } }
      });
      assert.deepEqual(
        cart.structuredContent.items,
        [],
        'Carts must not leak across client session IDs'
      );
    }
    const { resources } = await client.listResources();
    assert.equal(resources.length, 1);
    const resource = await client.readResource({ uri: resources[0].uri });
    assert.equal(resource.contents[0].text, html);
    assert.equal((await fetch(url + '/mcp')).status, 405);
    assert.equal(
      (
        await fetch(url + '/mcp', {
          method: 'POST',
          headers: {
            origin: 'https://untrusted.example',
            'Content-Type': 'application/json'
          },
          body: '{}'
        })
      ).status,
      403
    );
    console.log(
      `PASS ${template}: ${tools.length} tools, MCP HTTP, HTML resource, production build, TypeScript`
    );
  } catch (error) {
    console.error(logs);
    throw error;
  } finally {
    await client.close();
    child.kill();
  }
}

// Check the advertised development entrypoint, including the widget's first build.
const devDir = join(work, 'commerce');
const dev = spawn('pnpm', ['dev'], {
  cwd: devDir,
  detached: true,
  env: {
    ...process.env,
    PORT: '33200',
    CONVERSOKIT_API_KEYS: '',
    STRIPE_SECRET_KEY: '',
    SUPABASE_URL: '',
    VERCEL: ''
  },
  stdio: ['ignore', 'pipe', 'pipe']
});
let devLogs = '';
dev.stdout.on('data', (d) => (devLogs += d));
dev.stderr.on('data', (d) => (devLogs += d));
try {
  let ready = false;
  for (let n = 0; n < 150; n++) {
    try {
      if ((await fetch('http://127.0.0.1:33200/health')).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  assert(ready, devLogs);
  const devClient = new Client({ name: 'dev-test', version: '1' });
  try {
    await devClient.connect(
      new StreamableHTTPClientTransport(new URL('http://127.0.0.1:33200/mcp'))
    );
    // The initial watch build must not remove the already served widget.
    for (let n = 0; n < 20; n++) {
      const resource = await devClient.readResource({ uri: 'ui://conversokit/app-v1.html' });
      assert(String(resource.contents[0].text).includes('<script'));
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } finally {
    await devClient.close();
  }
  console.log('PASS pnpm dev: starts MCP and serves the built widget');
} finally {
  process.kill(-dev.pid, 'SIGTERM');
}
console.log(`Scaffolds retained for browser validation: ${work}`);
