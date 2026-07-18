import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_ENDPOINT = 'http://localhost:3000/mcp';

let clientPromise: Promise<Client> | undefined;

async function connectClient(): Promise<Client> {
  const client = new Client(
    { name: 'proofyield-browser-dashboard', version: '1.1.0' },
    { capabilities: {} },
  );
  const transport = new StreamableHTTPClientTransport(new URL(MCP_ENDPOINT));
  await client.connect(transport);
  return client;
}

async function getClient(): Promise<Client> {
  if (!clientPromise) {
    clientPromise = connectClient().catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }
  return clientPromise;
}

export async function callBrowserMcpTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
  const client = await getClient();
  const response = await client.callTool({ name, arguments: args });

  if ('toolResult' in response) return response.toolResult as T;

  const text = response.content
    .filter((item): item is Extract<(typeof response.content)[number], { type: 'text' }> => item.type === 'text')
    .map((item) => item.text)
    .join('\n');

  if (response.isError) throw new Error(text || `${name} failed`);
  if (response.structuredContent !== undefined) return response.structuredContent as T;
  if (!text) throw new Error(`${name} returned no readable content.`);

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${name} returned unreadable content.`);
  }
}
