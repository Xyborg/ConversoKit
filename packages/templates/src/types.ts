export interface TemplateAuth {
  default?: 'apiKey' | 'jwt' | 'oauth' | 'anonymous';
  providers?: string[];
}

export interface TemplateCompliance {
  requiresConsent?: boolean;
  privacyUrl?: string;
  termsUrl?: string;
  consentScopes?: string[];
}

export interface AppTemplate {
  name: string;
  description: string;
  /** Tool names the MCP server must implement. */
  tools: string[];
  /** Widget names the widget UI must register. */
  widgets: string[];
  /** Integration provider IDs the consumer app should wire up. */
  integrations: string[];
  auth?: TemplateAuth;
  compliance?: TemplateCompliance;
  /** Optional bundled mock data for the template. */
  exampleData?: Record<string, unknown>;
}
