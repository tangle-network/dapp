import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { useCallback, useMemo } from 'react';
import useApiRx from '../../hooks/useApiRx';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import createAssetIdEnum from '../../utils/createAssetIdEnum';
import useRestakeDelegatorInfo from '../restake/useRestakeDelegatorInfo';
import { map } from 'rxjs';

/**
 * Return the list of vault IDs that the current active user has deposited into.
 */
const useUserDepositedVaultIds = () => {
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const assetIds = useMemo(() => {
    return Object.entries(delegatorInfo?.deposits ?? {})
      .filter(([, { amount }]) => amount > ZERO_BIG_INT)
      .map(([assetId]) => createAssetIdEnum(assertRestakeAssetId(assetId)));
  }, [delegatorInfo?.deposits]);

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query.rewards?.assetLookupRewardVaults === undefined) {
          return null;
        }

        return apiRx.query.rewards.assetLookupRewardVaults
          .multi(assetIds)
          .pipe(
            map((vaultIds) =>
              vaultIds
                .filter((vaultId) => vaultId.isSome)
                .reduce(
                  (vaultIdSet, vaultId) =>
                    vaultIdSet.add(vaultId.unwrap().toNumber()),
                  new Set<number>(),
                ),
            ),
          );
      },
      [assetIds],
    ),
  );
};

export default useUserDepositedVaultIds;
