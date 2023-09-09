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

    const relayersSub = activeApi.relayerManager.listUpdated.subscribe(
      async () => {
        const typedChainIdToUse =
          typedChainId ?? activeApi.typedChainidSubject.getValue();

        const relayers = activeApi.relayerManager.getRelayersByChainAndAddress(
          typedChainIdToUse,
          `${target ?? ''}`
        );

        setRelayersState((prev) => ({
          ...prev,
          loading: false,
          relayers,
        }));
      }
    );

    const activeSub = activeApi.relayerManager.activeRelayerWatcher.subscribe(
      (next) => {
        setRelayersState((prev) => ({
          ...prev,
          activeRelayer: next,
        }));
      }
    );

    // trigger the relayer list update on mount
    activeApi.relayerManager.listUpdated$.next();

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
