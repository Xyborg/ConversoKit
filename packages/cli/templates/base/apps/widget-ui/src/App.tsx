import React from 'react';
import { ThemeProvider, lightTheme } from '@conversokit/themes';
import { BridgeProvider } from '@conversokit/bridge';
import { CTABanner } from '@conversokit/widgets';

const App: React.FC = () => {
  return (
    <BridgeProvider baseUrl="http://localhost:3000">
      <ThemeProvider
        theme={lightTheme}
        style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
      >
        <h1>Welcome to <% projectName %></h1>
        <p style={{ color: 'var(--ck-muted)' }}>
          Built with ConversoKit. Edit <code>apps/widget-ui/src/App.tsx</code> to
          start building.
        </p>
        <CTABanner
          title="Next steps"
          description="Add MCP tools in apps/mcp-server/src/tools and consume them via useBridge()."
          variant="info"
        />
      </ThemeProvider>
    </BridgeProvider>
  );
};

export default App;
