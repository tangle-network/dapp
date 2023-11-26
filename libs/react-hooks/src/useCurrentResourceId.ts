'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { ResourceId } from '@webb-tools/sdk-core/proposals/ResourceId';
import { parseTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
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
    ]).subscribe(async ([typedChainId, activeBridge]) => {
      if (!activeBridge) {
        resourceIdSubject.next(null);
        return;
      }

      const addressOrTreeId = activeBridge.targets[typedChainId];
      if (!addressOrTreeId) {
        console.error('No anchor address found for the current chain');
        resourceIdSubject.next(null);
        return;
      }

      const { chainId, chainType } = parseTypedChainId(typedChainId);

      const currentReourceId = resourceIdSubject.getValue();
      const nextReourceId =
        await activeApi.methods.variableAnchor.actions.inner.getResourceId(
          addressOrTreeId,
          chainId,
          chainType
        );

      if (currentReourceId?.toString() !== nextReourceId.toString()) {
        resourceIdSubject.next(nextReourceId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [activeApi]);

  return useObservableState(resourceIdSubject);
};
