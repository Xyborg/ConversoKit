import type { Tool } from '@conversokit/shared';
import type { z } from 'zod';

export interface BridgeSession {
  sessionId: string;
  userId?: string;
  authenticated: boolean;
}

export interface BridgeEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
}

export type BridgeEventHandler = (event: BridgeEvent) => void;

export interface BridgeOptions {
  baseUrl?: string;
  apiKey?: string;
  sessionId?: string;
  consent?: { scopes: string[]; acceptedAt: string };
}

export type ToolInput<T extends Tool> = z.infer<T['inputSchema']>;
export type ToolOutput<T extends Tool> = z.infer<T['outputSchema']>;

export interface Bridge {
  callTool<T extends Tool>(
    nameOrTool: string | T,
    input: T extends Tool ? ToolInput<T> : Record<string, unknown>
  ): Promise<T extends Tool ? ToolOutput<T> : unknown>;
  getSession(): Promise<BridgeSession>;
  onEvent(handler: BridgeEventHandler): () => void;
  isHostBridge(): boolean;
}

export interface OpenAiHostBridge {
  callTool?: (name: string, input: unknown) => Promise<unknown>;
  getSession?: () => Promise<BridgeSession>;
  onEvent?: (handler: BridgeEventHandler) => () => void;
  openExternalUrl?: (url: string) => Promise<void>;
}

declare global {
  interface Window {
    openai?: OpenAiHostBridge;
  }
}
