# @conversokit/shared

## 0.2.0

### Minor Changes

- Implement MCP Apps end to end: stateless Streamable HTTP at /mcp, registered HTML resources, explicit tool annotations, validated tool results, and shared REST/MCP permission checks through the new @conversokit/mcp package.

  Initialize the MCP Apps bridge in hosted widgets, normalize tool results, forward consent/session metadata, and open links through the host. Generate single-file widgets for all five templates, include the missing commerce cart/checkout tools, and bundle widget HTML in deployment configurations. Require Node 20 or newer. Generated projects require the fixed ThemeProvider release as well as the new bridge/server packages.

## 0.1.2

### Patch Changes

- 800bbde: Add react-dom peer dep on bridge/themes/widgets; add prepublishOnly safety script across packages
