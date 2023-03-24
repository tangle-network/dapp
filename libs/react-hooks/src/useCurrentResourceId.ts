import { useWebContext } from '@webb-tools/api-provider-environment';
import { parseTypedChainId, ResourceId } from '@webb-tools/sdk-core';
import { useObservableState } from 'observable-hooks';
import { useEffect } from 'react';
import { BehaviorSubject, combineLatest } from 'rxjs';

const resourceIdSubject = new BehaviorSubject<ResourceId | null>(null);

/**
 * Hook to get the current resource id
 * @returns The current resource id
 */
export const useCurrentResourceId = (): ResourceId | null => {
  const { activeApi } = useWebContext();

  useEffect(() => {
    if (!activeApi) return;

    const subscription = combineLatest([
      activeApi.typedChainidSubject,
      activeApi.state.$activeBridge,
    ]).subscribe(([typedChainId, activeBridge]) => {
      if (!activeBridge) {
        resourceIdSubject.next(null);
        return;
      }

      const address = activeBridge.targets[typedChainId];
      if (!address) {
        console.error('No anchor address found for the current chain');
        resourceIdSubject.next(null);
        return;
      }

      const { chainId, chainType } = parseTypedChainId(typedChainId);

      resourceIdSubject.next(new ResourceId(address, chainType, chainId));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeApi]);

  return useObservableState(resourceIdSubject);
};
