import React, { useState } from 'react';
import {
  CTABanner,
  ConsentBanner,
  LeadCaptureForm,
  MultiStepForm
} from '@conversokit/widgets';
import { EXAMPLE_LEAD_FORM } from '@conversokit/shared';
import { ThemeProvider, modernSaasTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

type Stage = 'intro' | 'quick' | 'full' | 'done';

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-4)',
  maxWidth: 720,
  margin: '0 auto'
};

const Onboarding: React.FC = () => {
  const bridge = useBridge();
  const [stage, setStage] = useState<Stage>('intro');
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
      setStage('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  if (stage === 'done' && submitted) {
    return (
      <div style={containerStyle}>
        <CTABanner
          title="You're in. We'll be in touch."
          description={`Lead ${submitted.leadId} synced via ${submitted.provider}.`}
          variant="success"
          primaryLabel="Start over"
          onPrimary={() => {
            setSubmitted(null);
            setStage('intro');
          }}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header>
        <h1 style={{ margin: 0 }}>Get started with Acme</h1>
        <p style={{ color: 'var(--ck-muted)', margin: '8px 0 0' }}>
          Pick a path. We'll route you to the right team and prefill your account.
        </p>
      </header>

      {error && <CTABanner title="Error" description={error} variant="danger" />}

      {stage === 'intro' && (
        <div style={{ display: 'flex', gap: 'var(--ck-spacing-2)', flexWrap: 'wrap' }}>
          <CTABanner
            title="Quick signup"
            description="Email + name. ~10 seconds."
            primaryLabel="Use quick form"
            onPrimary={() => setStage('quick')}
          />
          <CTABanner
            title="Tailored signup"
            description="3 steps. We'll match you to a plan + DRI."
            primaryLabel="Use tailored form"
            onPrimary={() => setStage('full')}
          />
        </div>
      )}

      {stage === 'quick' && (
        <LeadCaptureForm
          step={{
            id: 'contact',
            title: 'Quick signup',
            description: 'Just the essentials. ~10 seconds.',
            fields: [
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'email', label: 'Work email', type: 'email', required: true }
            ]
          }}
          submitLabel="Sign up"
          cancelLabel="Back"
          onCancel={() => setStage('intro')}
          onSubmit={(values) => submit('quick-signup', values)}
        />
      )}

      {stage === 'full' && (
        <MultiStepForm
          form={EXAMPLE_LEAD_FORM}
          onComplete={(values) => submit(EXAMPLE_LEAD_FORM.id, values)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={modernSaasTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <ConsentBanner
        scopes={['personalData']}
        message="By continuing you agree we can store your contact details and route them to our CRM."
      >
        <Onboarding />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
