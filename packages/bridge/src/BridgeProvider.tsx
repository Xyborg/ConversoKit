import React, { createContext, useContext, useMemo } from 'react';
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
    [bridge, options.baseUrl, options.apiKey, options.sessionId]
  );
  return <BridgeContext.Provider value={value}>{children}</BridgeContext.Provider>;
};

export function useBridge(): Bridge {
  const bridge = useContext(BridgeContext);
  if (!bridge) {
    throw new Error('useBridge must be used inside <BridgeProvider>');
  }
  return bridge;
}
