import { type OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';
import { WebbRelayer } from '@webb-tools/abstract-api-provider/relayer/webb-relayer';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StringParam, useQueryParam } from 'use-query-params';
import { NO_RELAYER_KEY, POOL_KEY, RELAYER_ENDPOINT_KEY } from '../constants';

const useRelayerWithRoute = (typedChainId?: number) => {
  const [searchParams] = useSearchParams();

  const { activeApi, apiConfig } = useWebContext();

  // State for active relayer
  const [relayerUrl, setRelayerUrl] = useQueryParam(
    RELAYER_ENDPOINT_KEY,
    StringParam
  );

  const [poolId, noRelayer] = useMemo(() => {
    const poolId = parseInt(searchParams.get(POOL_KEY) ?? '');

    return [
      Number.isNaN(poolId) ? undefined : poolId,
      !!searchParams.get(NO_RELAYER_KEY),
    ];
  }, [searchParams]);

  // Side effect for active relayer subsription
  useEffect(() => {
    const sub = activeApi?.relayerManager.activeRelayerWatcher.subscribe(
      (relayer) => {
        if (relayer) {
          setRelayerUrl(relayer.endpoint);
        } else {
          setRelayerUrl(undefined);
        }
      }
    );

    return () => sub?.unsubscribe();
  }, [setRelayerUrl, activeApi]);

  const anchorId = useMemo(() => {
    if (typeof poolId !== 'number' || typeof typedChainId !== 'number') {
      return;
    }

    return apiConfig.anchors[poolId]?.[typedChainId];
  }, [apiConfig.anchors, poolId, typedChainId]);

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
