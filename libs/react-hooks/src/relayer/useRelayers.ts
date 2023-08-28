import { RelayersState, WebbRelayer } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useEffect, useState } from 'react';

type UseRelayersProps = {
  typedChainId: number | undefined;
  target: string | number | undefined;
};

export const useRelayers = (props: UseRelayersProps) => {
  const { typedChainId, target } = props;
  const { activeApi } = useWebContext();

  const [relayersState, setRelayersState] = useState<RelayersState>({
    relayers: activeApi?.relayerManager.getRelayers({}) ?? [],
    activeRelayer: null,
    loading: true,
  });

  const setRelayer = useCallback(
    (nextRelayer: WebbRelayer | null) => {
      if (typedChainId) {
        activeApi?.relayerManager.setActiveRelayer(nextRelayer, typedChainId);
      }
    },
    [activeApi?.relayerManager, typedChainId]
  );

  useEffect(() => {
    if (!activeApi) {
      return;
    }

    const onListUpdate = async () => {
      const typedChainIdToUse =
        typedChainId ?? activeApi.typedChainidSubject.getValue();

      const relayers =
        await activeApi.relayerManager.getRelayersByChainAndAddress(
          typedChainIdToUse,
          `${target ?? ''}`
        );

      setRelayersState((prev) => ({
        ...prev,
        loading: false,
        relayers,
      }));

      const activeRelayer = activeApi.relayerManager.activeRelayer;
      if (!activeRelayer && relayers.length > 0) {
        activeApi.relayerManager.setActiveRelayer(
          relayers[0],
          typedChainIdToUse
        );
      }
    };

    const relayersSub =
      activeApi.relayerManager.listUpdated.subscribe(onListUpdate);

    const activeSub = activeApi.relayerManager.activeRelayerWatcher.subscribe(
      (next) => {
        setRelayersState((prev) => ({
          ...prev,
          activeRelayer: next,
        }));
      }
    );

    // Initially list updated not called, so we need to call it manually
    onListUpdate();

    return () => {
      relayersSub.unsubscribe();
      activeSub.unsubscribe();
    };
  }, [activeApi, target, typedChainId]);

  return {
    relayerMethods: activeApi?.relayerManager,
    setRelayer,
    relayersState,
  };
};
