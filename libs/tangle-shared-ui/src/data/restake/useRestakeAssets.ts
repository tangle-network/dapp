import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { mergeMap, switchMap } from 'rxjs';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import useViemPublicClient from '../../hooks/useViemPublicClient';
import { queryAssetsRx } from '../../queries/restake/assetDetails';
import { assetIdsRxQuery } from '../../queries/restake/assetIds';
import { rewardVaultRxQuery } from '../../queries/restake/rewardVault';
import rewardVaultsPotAccountsRxQuery from '../../queries/restake/rewardVaultsPotAccounts';

const useRestakeAssets = () => {
  const { apiRx, apiRxLoading, apiRxError } = usePolkadotApi();
  const { activeChain, isConnecting, loading } = useWebContext();
  const viemPublicClient = useViemPublicClient();

  const rewardVault$ = useMemo(
    () =>
      // Retrieve all vaults that have pot accounts
      rewardVaultsPotAccountsRxQuery(apiRx).pipe(
        switchMap((vaultsPotAccounts) => {
          const vaultIds = vaultsPotAccounts.keys().toArray();

          return rewardVaultRxQuery(apiRx, vaultIds);
        }),
      ),
    [apiRx],
  );

  const assetIds$ = useMemo(
    () => assetIdsRxQuery(rewardVault$),
    [rewardVault$],
  );

  const assets$ = useMemo(
    () =>
      assetIds$.pipe(
        mergeMap((assetIds) =>
          queryAssetsRx(
            apiRx,
            assetIds,
            activeChain?.nativeCurrency,
            viemPublicClient,
          ),
        ),
      ),
    [activeChain?.nativeCurrency, apiRx, assetIds$, viemPublicClient],
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
