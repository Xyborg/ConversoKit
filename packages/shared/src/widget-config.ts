import type { ZodType } from 'zod';

export interface CTA {
  label: string;
  kind: 'tool' | 'link' | 'event';
  payload?: unknown;
}

export interface WidgetPermissions {
  collectPersonalData?: boolean;
  requiresConsent?: boolean;
  supportsOAuth?: boolean;
  allowsExternalLinks?: boolean;
  allowsFileUpload?: boolean;
}

export interface WidgetAppearance {
  theme?: string;
  density?: 'compact' | 'comfortable';
  style?: 'modern' | 'minimal' | 'enterprise';
}

export interface WidgetActions {
  primaryCTA?: CTA;
  secondaryCTA?: CTA;
}

export interface WidgetConfig {
  permissions: WidgetPermissions;
  appearance: WidgetAppearance;
  actions: WidgetActions;
}

export type WidgetCategory =
  | 'core'
  | 'commerce'
  | 'booking'
  | 'leadgen'
  | 'travel'
  | 'dashboard';

export interface WidgetMeta<S extends ZodType = ZodType> {
  name: string;
  category: WidgetCategory;
  version: string;
  config: WidgetConfig;
  schema: S;
}

export const defaultWidgetConfig: WidgetConfig = {
  permissions: {},
  appearance: {},
  actions: {}
};
