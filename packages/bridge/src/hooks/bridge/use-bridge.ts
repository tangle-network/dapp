import { BridgeConfig, bridgeConfig, BridgeCurrency, ChainId } from '@webb-dapp/apps/configs';
import { Bridge } from '@webb-dapp/react-environment';
import { useCallback, useMemo } from 'react';

export const useBridge = () => {
  const config = useMemo<BridgeConfig>(() => bridgeConfig, []);

  const getTokens = useCallback(() => {
    return Bridge.getTokens(config);
  }, [config]);

  const getTokensOfChain = useCallback(
    (chain: ChainId) => {
      return Bridge.getTokensOfChain(config, chain);
    },
    [config]
  );
  const getBridge = (bridgeCurrency: BridgeCurrency) => {
    return Bridge.from(bridgeCurrency);
  };
  return {
    getBridge,
    config,
    getTokensOfChain,
    getTokens,
  };
};
