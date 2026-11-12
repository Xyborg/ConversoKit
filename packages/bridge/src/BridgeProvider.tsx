import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
  useState
} from 'react';
import { createBridge } from './createBridge.js';
import type { Bridge, BridgeOptions } from './types.js';

const BridgeContext = createContext<Bridge | null>(null);

export interface BridgeProviderProps extends BridgeOptions {
  children: React.ReactNode;
  bridge?: Bridge;
}

export const BridgeProvider: React.FC<BridgeProviderProps> = ({
  children,
  bridge,
  ...options
}) => {
  const value = useMemo(
    () => bridge ?? createBridge(options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      bridge,
      options.baseUrl,
      options.apiKey,
      options.sessionId,
      options.mode,
      options.transport,
      options.connectTimeoutMs
    ]
  );
  const cleanup = useRef(new Map<Bridge, ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const timers = cleanup.current;
    clearTimeout(timers.get(value));
    void value
      .connect()
      .catch((error) => console.error('MCP Apps connection failed', error));
    return () => {
      if (!bridge)
        timers.set(
          value,
          setTimeout(() => {
            void value.close();
            timers.delete(value);
          }, 0)
        );
    };
  }, [value, bridge]);
  useEffect(() => {
    value.setConsent(options.consent);
  }, [value, options.consent]);
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
};

export function useBridge(): Bridge {
  const bridge = useContext(BridgeContext);
  if (!bridge) {
    throw new Error('useBridge must be used inside <BridgeProvider>');
  }
  return bridge;
}

/** Latest model-initiated tool output, including the result that opened this iframe. */
export function useToolOutput<T = unknown>(): T | undefined {
  const bridge = useBridge();
  const [output, setOutput] = useState(() => bridge.getToolOutput() as T | undefined);
  useEffect(() => {
    setOutput(bridge.getToolOutput() as T | undefined);
    return bridge.onEvent((event) => {
      if (event.type === 'tool-result') setOutput(event.payload as T);
    });
  }, [bridge]);
  return output;
}
