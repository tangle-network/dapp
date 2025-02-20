import { useMemo } from 'react';
import { map } from 'rxjs';
import { assetIdsQuery } from '../../queries/restake/assetIds';
import { rewardVaultRxQuery } from '../../queries/restake/rewardVault';
import { RestakeAssetId } from '../../types';
import useVaultsPotAccounts from '../rewards/useVaultsPotAccounts';

/**
 * Retrieves the whitelisted asset IDs for restaking.
 * The hook returns an object containing the asset IDs and an observable to refresh the asset IDs.
 */
export default function useRestakeAssetIds(): RestakeAssetId[] {
  const { result: vaultPotAccounts } = useVaultsPotAccounts();

  const assetIds = useMemo(() => {
    if (vaultPotAccounts === null) {
      return null;
    }

    const vaultIds = vaultPotAccounts.keys().toArray();

    return rewardVaultRxQuery(apiRx, vaultIds).pipe(
      map((rewardVaults) => assetIdsQuery(rewardVaults)),
    );
  }, [vaultPotAccounts]);

  return assetIds;
}
