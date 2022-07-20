import { Currency, TypedChainId } from '@webb-dapp/api-providers';
import { useWebContext } from '@webb-dapp/react-environment';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useBridge = () => {
  const { activeApi } = useWebContext();
  const bridgeApi = useMemo(() => activeApi?.methods.anchorApi, [activeApi]);
  const [tokens, setTokens] = useState<Currency[]>([]);

  useEffect(() => {
    bridgeApi?.getCurrencies().then((c) => setTokens(c));
  }, [bridgeApi]);

  const getTokensOfChain = useCallback(
    (chainId: TypedChainId): Promise<Currency[]> => {
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
