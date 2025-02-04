import { useCallback } from 'react';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import useUserDepositedVaultIds from './useUserDepositedVaultIds';
import { map } from 'rxjs';
import { u128, u64 } from '@polkadot/types';

/**
 * @returns A map of vault id to the claimed reward (block number, amount) of the active user.
 */
const useUserVaultClaimedRewards = () => {
  const substrateAddress = useSubstrateAddress();
  const { result: vaultIds } = useUserDepositedVaultIds();

  return useApiRx(
    useCallback(
      (apiRx) => {
        if (apiRx.query.rewards?.userClaimedReward === undefined) {
          return null;
        }

        if (vaultIds === null || substrateAddress === null) {
          return null;
        }

        return apiRx.query.rewards.userClaimedReward
          .multi(
            Array.from(vaultIds.values()).map(
              (vaultId) => [substrateAddress, vaultId] as const,
            ),
          )
          .pipe(
            map((results) => {
              return results.reduce((userClaimedRewardMap, result, idx) => {
                if (result.isSome) {
                  userClaimedRewardMap.set(idx, result.unwrap());
                }
                return userClaimedRewardMap;
              }, new Map<number, [u64, u128]>());
            }),
          );
      },
      [substrateAddress, vaultIds],
    ),
  );
};

export default useUserVaultClaimedRewards;
