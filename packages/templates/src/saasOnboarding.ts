import { EXAMPLE_LEAD_FORM } from '@conversokit/shared';
import type { AppTemplate } from './types.js';

export function createSaasOnboardingTemplate(): AppTemplate {
  return {
    name: 'saas-onboarding',
    description:
      'SaaS qualification and onboarding flow: multi-step lead capture wired to a CRM.',
    tools: ['submit_lead'],
    widgets: ['MultiStepForm', 'LeadCaptureForm', 'CTABanner', 'ConsentBanner'],
    integrations: ['mockCrm'],
    auth: { default: 'anonymous' },
    compliance: {
      requiresConsent: true,
      consentScopes: ['personalData', 'marketing']
    },
    exampleData: {
      leadForm: EXAMPLE_LEAD_FORM
    }
  };
}
