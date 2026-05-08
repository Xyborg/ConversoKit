import { z } from 'zod';

export const consentScopeSchema = z.enum([
  'analytics',
  'personalData',
  'marketing',
  'externalLinks',
  'fileUpload'
]);

export type ConsentScope = z.infer<typeof consentScopeSchema>;

export const consentRecordSchema = z.object({
  scopes: z.array(consentScopeSchema),
  acceptedAt: z.string()
});

export type ConsentRecord = z.infer<typeof consentRecordSchema>;

export interface RetentionPolicy {
  /** Days to retain user data before automatic deletion. */
  defaultDays: number;
  /** Per-scope override (in days). */
  perScope?: Partial<Record<ConsentScope, number>>;
}

export const defaultRetentionPolicy: RetentionPolicy = {
  defaultDays: 365
};
