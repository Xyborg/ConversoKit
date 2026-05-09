import React, { useEffect, useState } from 'react';
import {
  AlertFeed,
  AnalyticsPanel,
  CTABanner,
  ConsentBanner,
  KPIGrid,
  LeadCaptureForm,
  MultiStepForm,
  TrendChart
} from '@conversokit/widgets';
import {
  EXAMPLE_LEAD_FORM,
  type Alert,
  type AnalyticsPanel as AnalyticsPanelData,
  type KPI,
  type TrendSeries
} from '@conversokit/shared';
import { ThemeProvider, enterpriseTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

type TabKey = 'capture' | 'pipeline' | 'insights' | 'consent';

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-4)'
};

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '8px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: active ? 'var(--ck-primary)' : 'var(--ck-surface)',
  color: active ? 'var(--ck-primary-foreground)' : 'var(--ck-text)',
  cursor: 'pointer'
});

const Capture: React.FC = () => {
  const bridge = useBridge();
  const [mode, setMode] = useState<'quick' | 'full'>('quick');
  const [submitted, setSubmitted] = useState<{
    leadId: string;
    provider: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (
    formId: string,
    values: Record<string, string | number | boolean>
  ) => {
    setError(null);
    try {
      const r = (await bridge.callTool('submit_lead', {
        formId,
        values,
        submittedAt: new Date().toISOString()
      })) as { leadId: string; provider: string };
      setSubmitted(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  if (submitted) {
    return (
      <div style={sectionStyle}>
        <CTABanner
          title="Lead synced"
          description={`Lead ${submitted.leadId} via ${submitted.provider}.`}
          variant="success"
          primaryLabel="Capture another"
          onPrimary={() => setSubmitted(null)}
        />
      </div>
    );
  }

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <div style={{ display: 'flex', gap: 'var(--ck-spacing-2)' }}>
        <button type="button" style={tabBtn(mode === 'quick')} onClick={() => setMode('quick')}>
          Quick form
        </button>
        <button type="button" style={tabBtn(mode === 'full')} onClick={() => setMode('full')}>
          Multi-step qualify
        </button>
      </div>
      {mode === 'quick' ? (
        <LeadCaptureForm
          step={{
            id: 'contact',
            title: 'Capture contact',
            description: 'Synced to HubSpot if HUBSPOT_API_KEY is set, otherwise mock CRM.',
            fields: [
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'email', label: 'Email', type: 'email', required: true },
              { name: 'company', label: 'Company', type: 'text' }
            ]
          }}
          submitLabel="Sync to CRM"
          onSubmit={(values) => submit('quick-capture', values)}
        />
      ) : (
        <MultiStepForm
          form={EXAMPLE_LEAD_FORM}
          onComplete={(values) => submit(EXAMPLE_LEAD_FORM.id, values)}
        />
      )}
    </div>
  );
};

const Pipeline: React.FC = () => {
  const bridge = useBridge();
  const [panel, setPanel] = useState<AnalyticsPanelData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [panelRes, alertsRes] = await Promise.all([
          bridge.callTool('get_analytics_panel', {}) as Promise<{
            panel: AnalyticsPanelData;
          }>,
          bridge.callTool('get_alerts', {}) as Promise<{ items: Alert[] }>
        ]);
        if (!cancelled) {
          setPanel(panelRes.panel);
          setAlerts(alertsRes.items);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      {panel && <AnalyticsPanel panel={panel} />}
      <h3 style={{ margin: 0 }}>Pipeline alerts</h3>
      <AlertFeed
        alerts={alerts}
        onAcknowledge={(a) =>
          setAlerts((current) => current.filter((x) => x.id !== a.id))
        }
      />
    </div>
  );
};

const Insights: React.FC = () => {
  const bridge = useBridge();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [series, setSeries] = useState<TrendSeries | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [kpiRes, seriesRes] = await Promise.all([
          bridge.callTool('get_kpis', {}) as Promise<{ kpis: KPI[] }>,
          bridge.callTool('get_trend_series', {}) as Promise<{ series: TrendSeries }>
        ]);
        if (!cancelled) {
          setKpis(kpiRes.kpis);
          setSeries(seriesRes.series);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bridge]);

  return (
    <div style={sectionStyle}>
      {error && <CTABanner title="Error" description={error} variant="danger" />}
      <KPIGrid kpis={kpis} />
      {series && <TrendChart series={series} />}
    </div>
  );
};

const ConsentTab: React.FC = () => (
  <div style={sectionStyle}>
    <h2 style={{ margin: 0 }}>Consent showcase</h2>
    <p style={{ color: 'var(--ck-muted)', margin: 0 }}>
      Every CRM capture flow runs inside <code>ConsentBanner</code> with the{' '}
      <code>personalData</code> scope. The banner blocks submissions until consent
      is granted. Try toggling localStorage key <code>ck:consent:demo-session</code>{' '}
      to see the gate.
    </p>
    <ConsentBanner
      scopes={['personalData', 'analytics']}
      message="The CRM assistant collects contact info to sync to HubSpot and tracks aggregate analytics."
    >
      <CTABanner
        title="Consent granted"
        description="The form below would now be unlocked."
        variant="success"
      />
    </ConsentBanner>
  </div>
);

const Assistant: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('capture');

  return (
    <div style={sectionStyle}>
      <header>
        <h1 style={{ margin: 0 }}>CRM assistant</h1>
        <p style={{ color: 'var(--ck-muted)', margin: '8px 0 0' }}>
          Capture leads, watch pipeline alerts, and read KPI insights — all wired through
          ConversoKit's MCP tools.
        </p>
      </header>

      <nav style={{ display: 'flex', gap: 'var(--ck-spacing-2)', flexWrap: 'wrap' }}>
        {(
          [
            ['capture', 'Capture'],
            ['pipeline', 'Pipeline'],
            ['insights', 'Insights'],
            ['consent', 'Consent']
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            style={tabBtn(tab === key)}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'capture' && <Capture />}
      {tab === 'pipeline' && <Pipeline />}
      {tab === 'insights' && <Insights />}
      {tab === 'consent' && <ConsentTab />}
    </div>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={enterpriseTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <ConsentBanner scopes={['personalData', 'analytics']}>
        <Assistant />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
