import {
  AppBridge,
  PostMessageTransport
} from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const frame = document.querySelector<HTMLIFrameElement>('#widget')!;
const status = document.querySelector('#status')!;
const log = (message: string) => {
  document.querySelector('#log')!.textContent += message + '\n';
};
let host: AppBridge | undefined;
let client: Client | undefined;
async function load() {
  await host?.close();
  await client?.close();
  document.querySelector('#log')!.textContent = '';
  const template = document.querySelector<HTMLSelectElement>('#template')!.value;
  status.textContent = `Loading ${template}`;
  client = new Client({ name: 'conversokit-browser-test', version: '1' });
  await client.connect(
    new StreamableHTTPClientTransport(new URL(`/server/${template}/mcp`, location.origin))
  );
  const { tools } = await client.listTools();
  log(`MCP initialized: ${tools.length} tools`);
  const tool = tools.find((t) => t.name === 'show_app')!;
  const result = await client.callTool({ name: tool.name, arguments: {} });
  const resource = await client.readResource({ uri: 'ui://conversokit/app-v1.html' });
  host = new AppBridge(
    client,
    { name: 'ConversoKit verification host', version: '1' },
    { openLinks: {} }
  );
  host.onopenlink = async ({ url }) => {
    log(`Open link requested: ${url}`);
    return {};
  };
  host.oninitialized = async () => {
    status.textContent = `${template}: MCP Apps handshake complete`;
    await host!.sendToolInput({ arguments: {} });
    await host!.sendToolResult(result);
  };
  await host.connect(
    new PostMessageTransport(frame.contentWindow!, frame.contentWindow!)
  );
  host.oncalltool = async (params) => {
    const result = await client!.callTool(params);
    log(
      `${params.name}: ${result.isError ? 'FAIL ' + JSON.stringify(result.content) : 'OK'}`
    );
    return result;
  };
  frame.srcdoc = String(resource.contents[0].text);
}
document.querySelector('#load')!.addEventListener(
  'click',
  () =>
    void load().catch((error) => {
      status.textContent = 'FAIL: ' + error.message;
    })
);
void load().catch((error) => {
  status.textContent = 'FAIL: ' + error.message;
});
