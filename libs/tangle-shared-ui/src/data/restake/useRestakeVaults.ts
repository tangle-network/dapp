import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useObservableState } from 'observable-hooks';
import { useMemo } from 'react';
import { mergeMap } from 'rxjs';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import { queryVaultsRx } from '../../queries/restake/assetDetails';
import { assetIdsRxQuery } from '../../queries/restake/assetIds';
import { rewardVaultRxQuery } from '../../queries/restake/rewardVault';

const useRestakeVaults = () => {
  const { apiRx, apiRxLoading, apiRxError } = usePolkadotApi();
  const { activeChain, isConnecting, loading } = useWebContext();

  const rewardVault$ = useMemo(() => rewardVaultRxQuery(apiRx), [apiRx]);

  const assetIds$ = useMemo(
    () => assetIdsRxQuery(rewardVault$),
    [rewardVault$],
  );

  const vaults$ = useMemo(
    () =>
      assetIds$.pipe(
        mergeMap((assetIds) =>
          queryVaultsRx(apiRx, assetIds, activeChain?.nativeCurrency),
        ),
      ),
    [activeChain?.nativeCurrency, apiRx, assetIds$],
  );

  const vaults = useObservableState(vaults$, {});

  return {
    vaults,
    vaults$,
    isLoading: apiRxLoading || isConnecting || loading,
    error: apiRxError,
  };
};

export default useRestakeVaults;
