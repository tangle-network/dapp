import { ChainId } from '@webb-dapp/apps/configs';
import { useWebContext } from '@webb-dapp/react-environment';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useBridge = () => {
  const { activeApi } = useWebContext();
  const bridgeApi = useMemo(() => activeApi?.methods.bridgeApi, [activeApi]);
  const [tokens, setTokens] = useState<Currency[]>([]);

  useEffect(() => {
    bridgeApi?.getCurrencies().then((c) => setTokens(c));
  }, [bridgeApi]);

  const getTokensOfChain = useCallback(
    (chainId: ChainId): Promise<Currency[]> => {
      return bridgeApi?.getTokensOfChain(chainId) ?? Promise.resolve([]);
    },
    [bridgeApi]
  );

  return {
    tokens,
    bridgeApi,
    getTokensOfChain,
  };
};
