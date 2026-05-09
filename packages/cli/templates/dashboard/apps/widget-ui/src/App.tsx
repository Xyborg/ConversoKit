import React, { useEffect, useState } from 'react';
import {
  AlertFeed,
  AnalyticsPanel,
  CTABanner
} from '@conversokit/widgets';
import {
  type Alert,
  type AnalyticsPanel as AnalyticsPanelData
} from '@conversokit/shared';
import { ThemeProvider, enterpriseTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

const Dashboard: React.FC = () => {
  const bridge = useBridge();
  const [panel, setPanel] = useState<AnalyticsPanelData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    Promise.all([
      bridge.callTool('get_analytics_panel', {}) as Promise<{
        panel: AnalyticsPanelData;
      }>,
      bridge.callTool('get_alerts', {}) as Promise<{ items: Alert[] }>
    ])
      .then(([p, a]) => {
        setPanel(p.panel);
        setAlerts(a.items);
      })
      .catch(console.error);
  }, [bridge]);

  return (
    <>
      {panel && <AnalyticsPanel panel={panel} />}
      <h3>Alerts</h3>
      <AlertFeed
        alerts={alerts}
        onAcknowledge={(a) =>
          setAlerts((current) => current.filter((x) => x.id !== a.id))
        }
      />
    </>
  );
};

const App: React.FC = () => {
  const apiKey = (import.meta.env?.VITE_CONVERSOKIT_API_KEY as string) || undefined;
  return (
    <BridgeProvider baseUrl="http://localhost:3000" apiKey={apiKey}>
      <ThemeProvider
        theme={enterpriseTheme}
        style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
      >
        <h1>Welcome to <% projectName %></h1>
        <CTABanner
          title="Internal dashboard"
          description="Set CONVERSOKIT_API_KEYS in apps/mcp-server/.env and pass it via VITE_CONVERSOKIT_API_KEY."
        />
        <Dashboard />
      </ThemeProvider>
    </BridgeProvider>
  );
};

export default App;
