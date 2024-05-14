import { useWebContext } from '@webb-tools/api-provider-environment/webb-context/index.js';
import { useMemo } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';
import { DEST_CHAIN_KEY, SOURCE_CHAIN_KEY } from '../constants/index.js';

/**
 * Get the source chain and destination chain info from search params
 * @returns an object containing:
 * - srcChainCfg: the source chain config
 * - srcTypedChainId: the source chain typed chain id
 * - destChainCfg: the destination chain config
 * - destTypedChainId: the destination chain typed chain id
 */
function useChainsFromRoute() {
  const { apiConfig } = useWebContext();

  const [
    { [SOURCE_CHAIN_KEY]: srcTypedChainId, [DEST_CHAIN_KEY]: destTypedChainId },
  ] = useQueryParams({
    [SOURCE_CHAIN_KEY]: NumberParam,
    [DEST_CHAIN_KEY]: NumberParam,
  });

  const srcChainCfg = useMemo(() => {
    if (typeof srcTypedChainId !== 'number') {
      return;
    }

    return apiConfig.chains[srcTypedChainId];
  }, [apiConfig.chains, srcTypedChainId]);

  const destChainCfg = useMemo(() => {
    if (typeof destTypedChainId !== 'number') {
      return;
    }

    return apiConfig.chains[destTypedChainId];
  }, [apiConfig.chains, destTypedChainId]);

  return {
    destChainCfg,
    destTypedChainId,
    srcChainCfg,
    srcTypedChainId,
  };
}

export default useChainsFromRoute;
