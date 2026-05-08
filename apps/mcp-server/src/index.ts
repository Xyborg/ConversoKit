import express from 'express';
import cors from 'cors';

// Import all tools defined in the tools directory
import { tools } from './tools/index.js';

const app = express();
app.use(cors());
app.use(express.json());

/**
 * GET /tools
 *
 * Returns a list of the available tool definitions.  Each tool definition exposes
 * its name, description, and the JSON schemas describing its inputs and outputs.
 * In a production MCP server this endpoint would be exposed via the Model
 * Context Protocol to allow ChatGPT to discover your server's capabilities.
 */
app.get('/tools', (_req, res) => {
  const list = tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema
  }));
  res.json({ tools: list });
});

/**
 * POST /tools/:name
 *
 * Invokes a tool by name.  The request body must conform to the tool's
 * input schema; if it does not, a 400 error will be returned.  The response
 * will contain the tool's output.  This is a simplified handler for
 * demonstration purposes; additional context such as user authentication can
 * be passed via headers or other middleware.
 */
app.post('/tools/:name', async (req, res) => {
  const name = req.params.name;
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }
  try {
    const input = tool.inputSchema.parse(req.body);
    const output = await tool.handler(input);
    res.json(output);
  } catch (err: any) {
    // If parsing fails or handler throws, return error information
    res.status(400).json({ error: err?.message ?? 'Tool execution failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
});