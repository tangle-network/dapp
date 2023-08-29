import { useSearchParams } from 'react-router-dom';
import useStateWithRoute from '../../../../../hooks/useStateWithRoute';
import {
  DEST_CHAIN_KEY,
  NO_RELAYER_KEY,
  POOL_KEY,
  RELAYER_ENDPOINT_KEY,
} from '../../../../../constants';
import { useEffect, useMemo, useRef } from 'react';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';

const useRelayerWithRoute = () => {
  const [searchParams] = useSearchParams();

  const { activeApi, apiConfig } = useWebContext();

  // State for active selected relayer
  const [relayer, setRelayer] = useStateWithRoute(RELAYER_ENDPOINT_KEY);

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

  const relayerInstance = useMemo(() => {
    const relayers = activeApi?.relayerManager.getRelayers({});
    if (!relayers) {
      return undefined;
    }

    return relayers.find((r) => r.endpoint === relayer);
  }, [activeApi?.relayerManager, relayer]);

  return {
    relayerInstance,
  };
};

export default useRelayerWithRoute;
