import React, { useState } from 'react';
import {
  leadFormSchema,
  defaultWidgetConfig,
  type LeadForm,
  type WidgetMeta
} from '@conversokit/shared';
import { LeadCaptureForm, type LeadFormValues } from './LeadCaptureForm.js';

export interface MultiStepFormProps {
  form: LeadForm;
  initialValues?: LeadFormValues;
  onComplete: (values: LeadFormValues) => void | Promise<void>;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-2)',
  fontFamily: 'var(--ck-font-family)',
  color: 'var(--ck-text)',
  maxWidth: 520
};

const stepperRow: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--ck-spacing-2)',
  fontSize: 'var(--ck-font-size-sm)',
  color: 'var(--ck-muted)'
};

function dotStyle(active: boolean, done: boolean): React.CSSProperties {
  return {
    width: 10,
    height: 10,
    borderRadius: '50%',
    backgroundColor: done
      ? 'var(--ck-success)'
      : active
        ? 'var(--ck-primary)'
        : 'var(--ck-border)',
    display: 'inline-block',
    marginRight: 6
  };
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  form,
  initialValues,
  onComplete
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<LeadFormValues>(initialValues ?? {});
  const step = form.steps[stepIndex];
  const isLast = stepIndex === form.steps.length - 1;

  const handleSubmit = async (stepValues: LeadFormValues) => {
    const merged = { ...values, ...stepValues };
    setValues(merged);
    if (isLast) {
      await onComplete(merged);
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <div style={containerStyle} data-testid="multi-step-form">
      <h3 style={{ margin: 0 }}>{form.title}</h3>
      <div style={stepperRow}>
        {form.steps.map((s, i) => (
          <span key={s.id}>
            <span style={dotStyle(i === stepIndex, i < stepIndex)} />
            {s.title}
          </span>
        ))}
      </div>
      <LeadCaptureForm
        key={step.id}
        step={step}
        defaultValues={values}
        submitLabel={isLast ? 'Submit' : 'Next'}
        cancelLabel="Back"
        onSubmit={handleSubmit}
        onCancel={stepIndex > 0 ? handleBack : undefined}
      />
    </div>
  );
};

export const MultiStepFormMeta: WidgetMeta = {
  name: 'MultiStepForm',
  category: 'leadgen',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { collectPersonalData: true, requiresConsent: true }
  },
  schema: leadFormSchema
};
