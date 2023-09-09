import { useSearchParams } from 'react-router-dom';
import useStateWithRoute from '../../../../../hooks/useStateWithRoute';
import {
  DEST_CHAIN_KEY,
  NO_RELAYER_KEY,
  POOL_KEY,
  RELAYER_ENDPOINT_KEY,
} from '../../../../../constants';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { OptionalActiveRelayer } from '@webb-tools/abstract-api-provider/relayer/types';

const useRelayerWithRoute = () => {
  const [searchParams] = useSearchParams();

  const { activeApi, apiConfig } = useWebContext();

  // State for active selected relayer
  const [relayer, setRelayer] = useStateWithRoute(RELAYER_ENDPOINT_KEY);
  const [activeRelayer, setActiveRelayer] =
    useState<OptionalActiveRelayer>(null);

  const [destTypedChainId, poolId, noRelayer] = useMemo(() => {
    const destTypedId = parseInt(searchParams.get(DEST_CHAIN_KEY) ?? '');
    const poolId = parseInt(searchParams.get(POOL_KEY) ?? '');

    return [
      Number.isNaN(destTypedId) ? undefined : destTypedId,
      Number.isNaN(poolId) ? undefined : poolId,
      !!searchParams.get(NO_RELAYER_KEY),
    ];
  }, [searchParams]);

  // Side effect for active relayer subsription
  useEffect(() => {
    if (!activeApi) {
      return;
    }

    const sub = activeApi.relayerManager.activeRelayerWatcher.subscribe(
      (relayer) => {
        // console.log('relayer', relayer);
        setRelayer(relayer?.endpoint ?? '');
        setActiveRelayer(relayer);
      }
    );

    return () => sub.unsubscribe();
  }, [activeApi, setRelayer]);

  // Side effect for reset the active relayer
  // when no relayer is selected
  useEffect(() => {
    if (!noRelayer || !activeApi) {
      return;
    }

    const active = activeApi.relayerManager.activeRelayer;
    if (active) {
      activeApi.relayerManager.setActiveRelayer(
        null,
        activeApi.typedChainidSubject.getValue()
      );
    }
  }, [activeApi, noRelayer]);

  const hasSetDefaultRelayer = useRef(false);

  // Side effect for setting the default relayer
  // when the relayer list is loaded and no active relayer
  useEffect(() => {
    if (!activeApi || noRelayer || hasSetDefaultRelayer.current) {
      return;
    }

    const sub = activeApi.relayerManager.listUpdated.subscribe(async () => {
      const typedChainIdToUse =
        destTypedChainId ?? activeApi.typedChainidSubject.getValue();

      const target =
        typeof poolId === 'number'
          ? apiConfig.anchors[poolId]?.[typedChainIdToUse]
          : '';

      const relayers =
        await activeApi.relayerManager.getRelayersByChainAndAddress(
          typedChainIdToUse,
          target
        );

      const active = activeApi.relayerManager.activeRelayer;
      if (!active && relayers.length > 0) {
        activeApi.relayerManager.setActiveRelayer(
          relayers[0],
          typedChainIdToUse
        );
        hasSetDefaultRelayer.current = true;
      }
    });

    // trigger the relayer list update on mount
    activeApi.relayerManager.listUpdated$.next();

    return () => sub.unsubscribe();
  }, [activeApi, apiConfig.anchors, destTypedChainId, noRelayer, poolId]);

  // Side effect to update the active relayer
  // when the destination chain id or pool id changes
  // and the current active relayer not support the chain or pool
  useEffect(() => {
    if (typeof destTypedChainId !== 'number' || typeof poolId !== 'number') {
      return;
    }

    const relayerManager = activeApi?.relayerManager;
    if (!relayerManager) {
      return;
    }

    const anchorId = apiConfig.anchors[poolId]?.[destTypedChainId];
    if (!anchorId) {
      return;
    }

    const relayers = relayerManager.getRelayersByChainAndAddress(
      destTypedChainId,
      anchorId
    );

    const active = relayerManager.activeRelayer;
    if (!active) {
      return;
    }

    const found = relayers.find((r) => r.endpoint === active.endpoint);
    if (found) {
      return;
    }

    relayerManager.setActiveRelayer(relayers[0] ?? null, destTypedChainId);
  }, [poolId, destTypedChainId, activeApi?.relayerManager, apiConfig.anchors]);

  return {
    relayer,
    activeRelayer,
  };
};

export default useRelayerWithRoute;
