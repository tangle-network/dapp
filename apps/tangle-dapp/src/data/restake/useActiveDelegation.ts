import usePolkadotApi from '@tangle-network/tangle-shared-ui/hooks/usePolkadotApi';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { map, of } from 'rxjs';

const useActiveDelegation = () => {
  const activeSubstrateAddress = useSubstrateAddress();
  const { apiRx } = usePolkadotApi();

  const activeDelegation$ = useMemo(() => {
    if (apiRx.query.multiAssetDelegation?.delegators === undefined) {
      return of(null);
    }

    if (activeSubstrateAddress === null) {
      return of(null);
    }

    return apiRx.query.multiAssetDelegation
      .delegators(activeSubstrateAddress)
      .pipe(
        map((result) => {
          if (result.isNone) {
            return null;
          }

          return result.unwrap();
        }),
      );
  }, [activeSubstrateAddress, apiRx]);

  const result = useObservableState(activeDelegation$, null);

  return result;
};

export default useActiveDelegation;
