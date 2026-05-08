import type { LeadForm } from '../schemas/leadgen.js';

export const EXAMPLE_LEAD_FORM: LeadForm = {
  id: 'qualify-saas',
  title: 'Get a personalized recommendation',
  steps: [
    {
      id: 'contact',
      title: 'Tell us about you',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Work email', type: 'email', required: true },
        { name: 'company', label: 'Company', type: 'text', required: false }
      ]
    },
    {
      id: 'qualify',
      title: 'A few details',
      description: 'So we can route to the right team.',
      fields: [
        {
          name: 'teamSize',
          label: 'Team size',
          type: 'select',
          required: true,
          options: ['1', '2-10', '11-50', '51-200', '200+']
        },
        {
          name: 'useCase',
          label: 'What are you trying to build?',
          type: 'textarea',
          required: true
        }
      ]
    },
    {
      id: 'quote',
      title: 'Anything else?',
      fields: [
        {
          name: 'timeline',
          label: 'When do you want to launch?',
          type: 'select',
          options: ['ASAP', '1-3 months', '3-6 months', '6+ months']
        },
        {
          name: 'budget',
          label: 'Monthly budget',
          type: 'select',
          options: ['<$500', '$500-2k', '$2k-10k', '$10k+']
        }
      ]
    }
  ]
};
