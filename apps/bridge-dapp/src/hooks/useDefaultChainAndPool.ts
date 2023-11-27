import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useEffect, useMemo } from 'react';
import { NumberParam, useQueryParams } from 'use-query-params';
import { POOL_KEY, SOURCE_CHAIN_KEY } from '../constants';

/**
 * Hook containing side effects to set default source chain and pool id
 */
const useDefaultChainAndPool = () => {
  const { loading, isConnecting, apiConfig, activeChain, activeApi } =
    useWebContext();

  const [query, setQuery] = useQueryParams({
    [SOURCE_CHAIN_KEY]: NumberParam,
    [POOL_KEY]: NumberParam,
  });

  const { [SOURCE_CHAIN_KEY]: srcTypedChainId } = query;

  const hasDefaultChain = useMemo(() => {
    // If the app is loading or connecting, no need to check
    if (loading || isConnecting) {
      return true;
    }

    if (typeof srcTypedChainId === 'number') {
      return true;
    }

    return false;
  }, [loading, isConnecting, srcTypedChainId]);

  // Side effect to set default source chain
  useEffect(() => {
    if (hasDefaultChain) {
      return;
    }

    const defaultChain = Object.values(apiConfig.chains)[0];
    const typedChainId = activeChain
      ? calculateTypedChainId(activeChain.chainType, activeChain.id)
      : calculateTypedChainId(defaultChain.chainType, defaultChain.id);

    setQuery({ [SOURCE_CHAIN_KEY]: typedChainId });
  }, [activeChain, apiConfig.chains, hasDefaultChain, setQuery]);

  const activeBridge = useMemo(() => {
    return activeApi?.state.activeBridge;
  }, [activeApi]);

  // Find default pool id when source chain is changed
  const defaultPoolId = useMemo(() => {
    if (typeof srcTypedChainId !== 'number') {
      return;
    }

    const activeBridgeSupported =
      activeBridge &&
      Object.keys(activeBridge.targets).includes(`${srcTypedChainId}`);

    if (activeBridgeSupported) {
      return activeBridge.currency.id;
    }

    const anchor = Object.entries(apiConfig.anchors).find(
      ([, anchorsRecord]) => {
        return Object.keys(anchorsRecord).includes(`${srcTypedChainId}`);
      }
    );

    const pool = anchor?.[0];
    if (typeof pool !== 'string') {
      return;
    }

    return Number(pool);
  }, [activeBridge, apiConfig.anchors, srcTypedChainId]);

  // Side effect to set default pool id
  useEffect(() => {
    if (typeof defaultPoolId !== 'number') {
      return;
    }

    setQuery({ [POOL_KEY]: defaultPoolId });
  }, [defaultPoolId, setQuery]);
};

export default useDefaultChainAndPool;
