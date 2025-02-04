import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { mergeMap } from 'rxjs';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { queryAssetsRx } from '../../queries/restake/assetDetails';
import { assetIdsRxQuery } from '../../queries/restake/assetIds';
import { rewardVaultRxQuery } from '../../queries/restake/rewardVault';

const useRestakeAssets = () => {
  const { apiRx, apiRxLoading, apiRxError } = usePolkadotApi();
  const { activeChain, isConnecting, loading } = useWebContext();

  const rewardVault$ = useMemo(() => rewardVaultRxQuery(apiRx), [apiRx]);

  const assetIds$ = useMemo(
    () => assetIdsRxQuery(rewardVault$),
    [rewardVault$],
  );

  const assets$ = useMemo(
    () =>
      assetIds$.pipe(
        mergeMap((assetIds) =>
          queryAssetsRx(apiRx, assetIds, activeChain?.nativeCurrency),
        ),
      ),
    [activeChain?.nativeCurrency, apiRx, assetIds$],
  );

  const assets = useObservableState(assets$, {});

  return {
    assets,
    assets$,
    isLoading: apiRxLoading || isConnecting || loading,
    error: apiRxError,
  };
};

export default useRestakeAssets;
