import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { mergeMap } from 'rxjs';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { assetDetailsRxQuery } from '../../queries/restake/assetDetails';
import { assetIdsRxQuery } from '../../queries/restake/assetIds';
import { rewardVaultRxQuery } from '../../queries/restake/rewardVault';

/**
 * Hook to retrieve the asset map for restaking.
 * @returns
 *  - `assetMap`: The asset map.
 *  - `assetMap$`: The observable for the asset map.
 */
export default function useRestakeAssetMap() {
  const { apiRx } = usePolkadotApi();
  const { activeChain } = useWebContext();

  const rewardVault$ = useMemo(() => rewardVaultRxQuery(apiRx), [apiRx]);

  const assetIds$ = useMemo(
    () => assetIdsRxQuery(rewardVault$),
    [rewardVault$],
  );

  const assetMap$ = useMemo(
    () =>
      assetIds$.pipe(
        mergeMap((assetIds) =>
          assetDetailsRxQuery(
            apiRx,
            assetIds.map((assetId) => assetId.toString()),
            activeChain?.nativeCurrency,
          ),
        ),
      ),
    [activeChain?.nativeCurrency, apiRx, assetIds$],
  );

  const assetMap = useObservableState(assetMap$, {});

  return {
    assetMap,
    assetMap$,
  };
}
