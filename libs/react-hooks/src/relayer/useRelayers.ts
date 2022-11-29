import {
  OptionalActiveRelayer,
  RelayersState,
  WebbRelayer,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';

type UseRelayersProps = {
  typedChainId: number | undefined;
  target: string | number | undefined;
};

type SubscribeReturnType = Omit<Subscription, '_finalizers'>;

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
    [activeApi?.relayerManager]
  );

  useEffect(() => {
    let availableRelayersSubscription: SubscribeReturnType | null = null;
    let activeRelayerSubscription: SubscribeReturnType | null = null;

    // Populate the relayersState
    if (activeApi && typedChainId) {
      activeApi.relayerManager
        .getRelayersByChainAndAddress(typedChainId, String(target))
        .then((r: WebbRelayer[]) => {
          setRelayersState((p) => ({
            ...p,
            loading: false,
            relayers: r,
          }));
        });

      // Subscription used for listening to changes of the available relayers
      availableRelayersSubscription =
        activeApi?.relayerManager.listUpdated.subscribe(() => {
          activeApi?.relayerManager
            .getRelayersByChainAndAddress(typedChainId, String(target))
            .then((r: WebbRelayer[]) => {
              setRelayersState((p) => ({
                ...p,
                loading: false,
                relayers: r,
              }));
            });
        });

      // Subscription used for listening to changes of the activeRelayer
      activeRelayerSubscription =
        activeApi?.relayerManager.activeRelayerWatcher.subscribe(
          (next: OptionalActiveRelayer) => {
            setRelayersState((p) => ({
              ...p,
              activeRelayer: next,
            }));
          }
        );
    }

    return () => {
      availableRelayersSubscription?.unsubscribe();
      activeRelayerSubscription?.unsubscribe();
    };
  }, [activeApi, typedChainId]);

  return {
    relayerMethods: activeApi?.relayerManager,
    setRelayer,
    relayersState,
  };
};
