# Setup Guide

This guide walks you through setting up the ConversoKit SDK monorepo in a local development environment.

## Prerequisites

- **Node.js 18+**: The MCP server and widget UI are built with modern ECMAScript features.
- **pnpm**: A fast, disk‑efficient package manager used for managing dependencies across the monorepo.  Install globally via:

  ```bash
  npm install -g pnpm
  ```

- **Git**: To clone the repository and manage version control.

## Installation

Clone the repository and install dependencies:

```bash
git clone <your‑fork‑url> conversokit-sdk
cd conversokit-sdk
pnpm install
```

## Running the MCP server

Start the server in development mode:

```bash
pnpm --filter mcp-server dev
```

The server will start on `http://localhost:3000`.  It exposes a `/tools` endpoint for listing available tools and a `/tools/:name` endpoint for invoking a specific tool.

## Running the widget UI

Start the widget UI in development mode:

```bash
pnpm --filter widget-ui dev
```

The UI will be served at `http://localhost:5173`.  It will automatically reload when you make changes to the source files.

## Developing widgets

Reusable widgets live under `packages/widgets`.  Each widget is a React component accompanied by TypeScript definitions.  To add a new widget:

1. Create a new file in `packages/widgets/src` with your component and its props.
2. Export the component from `packages/widgets/src/index.ts`.
3. Rebuild the package with `pnpm --filter @conversokit/widgets build` or run it in watch mode with `pnpm --filter @conversokit/widgets dev`.

## Publishing templates

Templates live under `packages/templates`.  They describe collections of tools, widgets and sample data that can be used to scaffold new apps.  To add a template:

1. Create a new function in `packages/templates/src/index.ts` that returns an object with `name`, `description`, `tools`, `widgets` and `exampleData` fields.
2. Export the function from the module so that it can be imported by the CLI or scaffolding scripts.

## Next steps

- Add new tools to `apps/mcp-server/src/tools` to expose additional capabilities to ChatGPT.
- Build integrations under `packages/integrations` to connect your app to external services like Stripe, HubSpot or Notion.
- Implement authentication using the helpers in `packages/auth`.
- Create rich themes under `packages/themes` to customise the look and feel of your widgets.