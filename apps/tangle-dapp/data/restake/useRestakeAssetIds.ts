import type { u128, Vec } from '@polkadot/types';
import type { Evaluate } from '@webb-tools/dapp-types/utils/types';
import { useObservableState } from 'observable-hooks';
import { useMemo, useRef } from 'react';
import { type Observable, of } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';

export type UseRestakeAssetIdsReturnType = {
  assetIds: u128[];
  assetIds$: Observable<Vec<u128>>;
};

/**
 * Retrieves the whitelisted asset IDs for restaking.
 * The hook returns an object containing the asset IDs and an observable to refresh the asset IDs.
 */
export default function useRestakeAssetIds(): Evaluate<UseRestakeAssetIdsReturnType> {
  const { apiRx } = usePolkadotApi();

  /** Default value won't change, so useRef to keep the reference */
  const emptyVec = useRef(apiRx.createType('Vec<u128>', []));

  const assetIds$ = useMemo(
    () =>
      apiRx.query.multiAssetDelegation?.whitelistedAssets !== undefined
        ? apiRx.query.multiAssetDelegation.whitelistedAssets()
        : of(emptyVec.current),
    [apiRx.query.multiAssetDelegation],
  );

  const assetIds = useObservableState(assetIds$, emptyVec.current);

  return {
    assetIds,
    assetIds$,
  };
}
