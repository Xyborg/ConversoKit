import { z } from 'zod';

export const leadFieldTypeSchema = z.enum([
  'text',
  'email',
  'tel',
  'textarea',
  'select',
  'number'
]);

export type LeadFieldType = z.infer<typeof leadFieldTypeSchema>;

export const leadFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: leadFieldTypeSchema.optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional()
});

export type LeadField = z.infer<typeof leadFieldSchema>;

export const formStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fields: z.array(leadFieldSchema)
});

export type FormStep = z.infer<typeof formStepSchema>;

export const leadFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(formStepSchema)
});

export type LeadForm = z.infer<typeof leadFormSchema>;

export const leadSubmissionSchema = z.object({
  formId: z.string(),
  values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  submittedAt: z.string()
});

export type LeadSubmission = z.infer<typeof leadSubmissionSchema>;
