import { useObservable, useObservableState } from 'observable-hooks';
import { useRef } from 'react';
import { EMPTY } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';

/**
 * Retrieves the whitelisted asset IDs for restaking.
 * The hook returns an object containing the asset IDs and an observable to refresh the asset IDs.
 */
export default function useRestakingAssetIds() {
  const { apiPromise, apiRx } = usePolkadotApi();

  const assetIds$ = useObservable(
    () =>
      apiRx.query.multiAssetDelegation?.whitelistedAssets === undefined
        ? EMPTY
        : apiRx.query.multiAssetDelegation.whitelistedAssets(),
    [apiRx.query.multiAssetDelegation?.whitelistedAssets],
  );

  /** Default value won't change, so useRef to keep the reference */
  const emptyAssetIds = useRef(apiPromise.createType('Vec<u128>', []));

  const assetIds = useObservableState(assetIds$, emptyAssetIds.current);

  return {
    assetIds,
    assetIds$,
  };
}
