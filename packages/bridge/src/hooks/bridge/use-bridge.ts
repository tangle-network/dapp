import { useWebContext } from '@webb-dapp/react-environment';
import { ChainTypeId, Currency } from '@webb-tools/api-providers';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useBridge = () => {
  const { activeApi } = useWebContext();
  const bridgeApi = useMemo(() => activeApi?.methods.bridgeApi, [activeApi]);
  const [tokens, setTokens] = useState<Currency[]>([]);

  useEffect(() => {
    bridgeApi?.getCurrencies().then((c) => setTokens(c));
  }, [bridgeApi]);

  const getTokensOfChain = useCallback(
    (chainId: ChainTypeId): Promise<Currency[]> => {
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
