import { type OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import { WebbRelayer } from '@webb-tools/abstract-api-provider/relayer/webb-relayer';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useEffect, useMemo } from 'react';
import {
  BooleanParam,
  NumberParam,
  StringParam,
  useQueryParams,
} from 'use-query-params';
import {
  HAS_REFUND_KEY,
  NO_RELAYER_KEY,
  POOL_KEY,
  REFUND_RECIPIENT_KEY,
  RELAYER_ENDPOINT_KEY,
} from '../constants';

const useRelayerWithRoute = (typedChainId?: number | null) => {
  const { activeApi, apiConfig } = useWebContext();

  // State for active relayer
  const [query, setQuery] = useQueryParams({
    [RELAYER_ENDPOINT_KEY]: StringParam,
    [POOL_KEY]: NumberParam,
    [NO_RELAYER_KEY]: BooleanParam,
    [HAS_REFUND_KEY]: BooleanParam,
    [REFUND_RECIPIENT_KEY]: StringParam,
  });

  const {
    [RELAYER_ENDPOINT_KEY]: relayerUrl,
    [NO_RELAYER_KEY]: noRelayer,
    [POOL_KEY]: poolId,
  } = query;

  // Side effect for active relayer subsription
  useEffect(() => {
    const sub = activeApi?.relayerManager.activeRelayerWatcher.subscribe(
      (relayer) => {
        setQuery({
          [RELAYER_ENDPOINT_KEY]: relayer?.endpoint,
          ...(relayer == null
            ? {
                [HAS_REFUND_KEY]: undefined,
                [REFUND_RECIPIENT_KEY]: undefined,
              }
            : {}),
        });
      }
    );

    return () => sub?.unsubscribe();
  }, [activeApi?.relayerManager.activeRelayerWatcher, setQuery]);

  const anchorId = useMemo(() => {
    if (typeof poolId !== 'number' || typeof typedChainId !== 'number') {
      return;
    }

    return apiConfig.anchors[poolId]?.[typedChainId];
  }, [apiConfig.anchors, poolId, typedChainId]);

  // Side effect to check if active relayer is supported
  // If not, set the first supported relayer as active
  useEffect(() => {
    if (typeof anchorId !== 'string' || typeof typedChainId !== 'number') {
      return;
    }

    if (noRelayer || !activeApi?.relayerManager) {
      return;
    }

    const manager = activeApi.relayerManager;
    const supportedRelayers = manager.getRelayersByChainAndAddress(
      typedChainId,
      anchorId
    );

    if (!supportedRelayers || supportedRelayers.length === 0) {
      manager.setActiveRelayer(null, typedChainId);
      return;
    }

    const active = manager.activeRelayer;
    const isActiveRelayerSupported = supportedRelayers.find(
      (r) => r.endpoint === active?.endpoint
    );
    if (isActiveRelayerSupported) {
      return;
    }

    manager.setActiveRelayer(supportedRelayers[0], typedChainId);
  }, [activeApi?.relayerManager, anchorId, noRelayer, typedChainId]);

  const activeRelayer = useMemo<OptionalActiveRelayer>(() => {
    if (!relayerUrl || !activeApi?.relayerManager) {
      return null;
    }

    if (typeof typedChainId !== 'number') {
      return null;
    }

    const relayers = activeApi.relayerManager.getRelayers({});
    const relayer = relayers.find((r) => r.endpoint === relayerUrl);
    if (!relayer) {
      return null;
    }

    return WebbRelayer.intoActiveWebRelayer(relayer, {
      typedChainId,
      basedOn: activeApi.relayerManager.cmdKey,
    });
  }, [relayerUrl, activeApi?.relayerManager, typedChainId]);

  return activeRelayer;
};

export default useRelayerWithRoute;
