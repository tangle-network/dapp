import { InternalChainId } from '@webb-dapp/apps/configs';
import { Bridge } from '@webb-dapp/react-environment';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { useCallback } from 'react';

export const useBridge = () => {
  const getTokens = useCallback(() => {
    return Bridge.getTokens();
  }, []);

  const getTokensOfChain = useCallback((chain: InternalChainId) => {
    return Bridge.getTokensOfChain(chain);
  }, []);
  const getBridge = (bridgeCurrency: Currency) => {
    return Bridge.from(bridgeCurrency.view.id);
  };
  return {
    getBridge,
    getTokensOfChain,
    getTokens,
  };
};
