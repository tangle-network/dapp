import { OptionalActiveRelayer, RelayersState, WebbRelayer } from "@webb-tools/abstract-api-provider";
import { useWebContext } from "@webb-tools/api-provider-environment";
import { useCallback, useEffect, useState } from "react";

type UseRelayersProps = {
  typedChainId: number | undefined,
  target: string | number | undefined
}

export const useRelayers = ( props: UseRelayersProps ) => {
  const { activeApi } = useWebContext();

  const [relayersState, setRelayersState] = useState<RelayersState>({
    relayers: activeApi.relayerManager.getRelayers({}),
    activeRelayer: null,
    loading: true,
  });

  const setRelayer = useCallback(
    (nextRelayer: WebbRelayer | null) => {
      if (props.typedChainId) {
        activeApi?.relayerManager.setActiveRelayer(
          nextRelayer,
          props.typedChainId
        );
      }
    },
    [activeApi?.relayerManager]
  );

  useEffect(() => {
    let availableRelayersSubscription;
    let activeRelayerSubscription;

    // Populate the relayersState
    if (activeApi) {
      activeApi.relayerManager
        .getRelayersByChainAndAddress(props.typedChainId, String(props.target))
        .then((r: WebbRelayer[]) => {
          setRelayersState((p) => ({
            ...p,
            loading: false,
            relayers: r,
          }));
        });

      // Subscription used for listening to changes of the available relayers
      availableRelayersSubscription = activeApi?.relayerManager.listUpdated.subscribe(() => {
        activeApi?.relayerManager
          .getRelayersByChainAndAddress(props.typedChainId, String(props.target))
          .then((r: WebbRelayer[]) => {
            setRelayersState((p) => ({
              ...p,
              loading: false,
              relayers: r,
            }));
          });
        }
      );

      // Subscription used for listening to changes of the activeRelayer
      activeRelayerSubscription = activeApi?.relayerManager.activeRelayerWatcher.subscribe(
        (next: OptionalActiveRelayer) => {
          setRelayersState((p) => ({
            ...p,
            activeRelayer: next,
          }));
        }
      );
    }

    return () => {
      availableRelayersSubscription.unsubscribe();
      activeRelayerSubscription.unsubscribe();
    }
  }, [activeApi]);

  return {
    relayerMethods: activeApi?.relayerManager,
    setRelayer,
    relayersState
  };
}

