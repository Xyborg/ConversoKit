import React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import {
  formStepSchema,
  defaultWidgetConfig,
  type FormStep,
  type LeadField,
  type WidgetMeta
} from '@conversokit/shared';

export type LeadFormValues = Record<string, string | number | boolean>;

export interface LeadCaptureFormProps {
  step: FormStep;
  defaultValues?: LeadFormValues;
  submitLabel?: string;
  onSubmit: (values: LeadFormValues) => void | Promise<void>;
  cancelLabel?: string;
  onCancel?: () => void;
}

const containerStyle: React.CSSProperties = {
  border: '1px solid var(--ck-border)',
  borderRadius: 'var(--ck-radius-md)',
  padding: 'var(--ck-spacing-4)',
  backgroundColor: 'var(--ck-surface)',
  color: 'var(--ck-text)',
  fontFamily: 'var(--ck-font-family)',
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-2)',
  maxWidth: 480
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--ck-spacing-1)',
  fontSize: 'var(--ck-font-size-sm)'
};

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: 'var(--ck-background)',
  color: 'var(--ck-text)',
  fontFamily: 'var(--ck-font-family)',
  fontSize: 'var(--ck-font-size-base)'
};

const errorStyle: React.CSSProperties = {
  color: 'var(--ck-danger)',
  fontSize: 'var(--ck-font-size-sm)'
};

const buttonRow: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--ck-spacing-2)',
  marginTop: 'var(--ck-spacing-2)'
};

const primaryBtn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: 'none',
  backgroundColor: 'var(--ck-primary)',
  color: 'var(--ck-primary-foreground)',
  cursor: 'pointer',
  fontWeight: 'var(--ck-font-weight-bold)' as unknown as number
};

const secondaryBtn: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 'var(--ck-radius-sm)',
  border: '1px solid var(--ck-border)',
  backgroundColor: 'transparent',
  color: 'var(--ck-text)',
  cursor: 'pointer'
};

function renderField(field: LeadField, register: ReturnType<typeof useForm>['register']) {
  const id = `field-${field.name}`;
  const baseProps = register(field.name, { required: field.required });

  if (field.type === 'textarea') {
    return (
      <textarea
        id={id}
        rows={4}
        placeholder={field.placeholder}
        style={inputStyle}
        {...baseProps}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select id={id} style={inputStyle} {...baseProps}>
        <option value="">Select…</option>
        {field.options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      id={id}
      type={field.type}
      placeholder={field.placeholder}
      style={inputStyle}
      {...baseProps}
    />
  );
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  step,
  defaultValues,
  submitLabel = 'Continue',
  onSubmit,
  cancelLabel,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LeadFormValues>({ defaultValues });

  const submit: SubmitHandler<LeadFormValues> = async (values) => {
    await onSubmit(values);
  };

  return (
    <form
      style={containerStyle}
      onSubmit={handleSubmit(submit)}
      data-testid="lead-capture-form"
    >
      <h3 style={{ margin: 0 }}>{step.title}</h3>
      {step.description && (
        <p style={{ margin: 0, color: 'var(--ck-muted)' }}>{step.description}</p>
      )}
      {step.fields.map((field) => (
        <label key={field.name} htmlFor={`field-${field.name}`} style={labelStyle}>
          <span>
            {field.label}
            {field.required && (
              <span style={{ color: 'var(--ck-danger)' }}> *</span>
            )}
          </span>
          {renderField(field, register)}
          {errors[field.name] && (
            <span style={errorStyle}>This field is required</span>
          )}
        </label>
      ))}
      <div style={buttonRow}>
        {onCancel && (
          <button type="button" style={secondaryBtn} onClick={onCancel}>
            {cancelLabel ?? 'Back'}
          </button>
        )}
        <button type="submit" style={primaryBtn} disabled={isSubmitting}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export const LeadCaptureFormMeta: WidgetMeta = {
  name: 'LeadCaptureForm',
  category: 'leadgen',
  version: '0.1.0',
  config: {
    ...defaultWidgetConfig,
    permissions: { collectPersonalData: true, requiresConsent: true }
  },
  schema: formStepSchema
};
