import { ChainId } from '@webb-dapp/apps/configs';
import { Bridge, BridgeConfig } from '@webb-dapp/react-environment';
import { useCallback, useMemo } from 'react';

export const useBridge = () => {
  const config = useMemo<BridgeConfig>(() => ({}), []);

  const getTokens = useCallback(() => {
    return Bridge.getTokens(config);
  }, [config]);

  const getTokensOfChain = useCallback(
    (chain: ChainId) => {
      return Bridge.getTokensOfChain(config, chain);
    },
    [config]
  );
  return {
    config,
    getTokensOfChain,
    getTokens,
  };
};
