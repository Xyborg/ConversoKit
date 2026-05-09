import React, { useState } from 'react';
import {
  CTABanner,
  ConsentBanner,
  MultiStepForm
} from '@conversokit/widgets';
import { EXAMPLE_LEAD_FORM } from '@conversokit/shared';
import { ThemeProvider, modernSaasTheme } from '@conversokit/themes';
import { BridgeProvider, useBridge } from '@conversokit/bridge';

const Onboarding: React.FC = () => {
  const bridge = useBridge();
  const [done, setDone] = useState<{ leadId: string; provider: string } | null>(
    null
  );

  if (done) {
    return (
      <CTABanner
        title="Thanks!"
        description={`Lead ${done.leadId} synced via ${done.provider}.`}
        variant="success"
      />
    );
  }

  return (
    <MultiStepForm
      form={EXAMPLE_LEAD_FORM}
      onComplete={async (values) => {
        const r = (await bridge.callTool('submit_lead', {
          formId: EXAMPLE_LEAD_FORM.id,
          values,
          submittedAt: new Date().toISOString()
        })) as { leadId: string; provider: string };
        setDone(r);
      }}
    />
  );
};

const App: React.FC = () => (
  <BridgeProvider baseUrl="http://localhost:3000">
    <ThemeProvider
      theme={modernSaasTheme}
      style={{ minHeight: '100vh', padding: 'var(--ck-spacing-4)' }}
    >
      <h1>Welcome to <% projectName %></h1>
      <ConsentBanner scopes={['personalData', 'marketing']}>
        <Onboarding />
      </ConsentBanner>
    </ThemeProvider>
  </BridgeProvider>
);

export default App;
