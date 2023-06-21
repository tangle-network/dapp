import { useWebContext } from '@webb-tools/api-provider-environment';
import { useObservableState } from 'observable-hooks';
import { useEffect } from 'react';
import { BehaviorSubject } from 'rxjs';

const typedChainIdSub = new BehaviorSubject<number | undefined>(undefined);

const useCurrentTypedChainId = (): number | undefined => {
  const { activeApi } = useWebContext();

  useEffect(() => {
    if (!activeApi) return;

    const subscription = activeApi.typedChainidSubject.subscribe(
      (nextTypedChainId) => {
        if (nextTypedChainId !== typedChainIdSub.getValue()) {
          typedChainIdSub.next(nextTypedChainId);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [activeApi]);

  return useObservableState(typedChainIdSub);
};

export default useCurrentTypedChainId;
