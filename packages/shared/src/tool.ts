import { z } from 'zod';
import type { ZodType } from 'zod';

export interface ToolPermissions {
  requiresAuth?: boolean;
  requiresConsent?: boolean;
  scopes?: string[];
}

export interface ToolAuth {
  type: 'apiKey' | 'jwt' | 'oauth' | 'anonymous';
  user?: { id: string; email?: string };
}

export interface ToolConsent {
  scopes: string[];
  acceptedAt: string;
}

export interface ToolLogger {
  info(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

export interface ToolContext {
  userId?: string;
  sessionId: string;
  auth?: ToolAuth;
  consent?: ToolConsent;
  logger: ToolLogger;
}

export interface RateLimitConfig {
  perMinute?: number;
  perHour?: number;
}

export interface Tool<I extends ZodType = ZodType, O extends ZodType = ZodType> {
  name: string;
  description: string;
  inputSchema: I;
  outputSchema: O;
  permissions: ToolPermissions;
  rateLimit?: RateLimitConfig;
  handler(input: z.infer<I>, ctx: ToolContext): Promise<z.infer<O>>;
}

export function defineTool<I extends ZodType, O extends ZodType>(
  tool: Tool<I, O>
): Tool<I, O> {
  return tool;
}
