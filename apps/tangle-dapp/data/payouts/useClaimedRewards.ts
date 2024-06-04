import type { ApiRx } from '@polkadot/api';
import type { u32, Vec } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';

/**
 * Get all claimed rewards in the storage,
 * and store them in a map for easy access.
 * @returns keyed by era and validator stash
 * which maps to the set of page indexes which have been claimed.
 */
const useClaimedRewards = () => useApiRx(claimedRewardsFetcher);

export default useClaimedRewards;

const claimedRewardsFetcher = (api: ApiRx) =>
  // For some reason, the type of this query is not correct,
  // so we need to manually specify the correct type
  api.query.staking.claimedRewards.entries<Vec<u32>, [u32, AccountId32]>().pipe(
    map((entries) =>
      entries.reduce((claimedRewardsMap, [key, value]) => {
        const era = key.args[0].toNumber();
        const validatorAddress = key.args[1].toString();

        const pageIndexes = value
          .slice()
          .reduce(
            (pageIdxes, idx) => pageIdxes.add(idx.toNumber()),
            new Set<number>(),
          );

        let validatorMap = claimedRewardsMap.get(era);

        if (validatorMap === undefined) {
          validatorMap = new Map<string, Set<number>>();
          claimedRewardsMap.set(era, validatorMap);
        }

        const validatorClaimedPageIdxes = validatorMap.get(validatorAddress);

        if (validatorClaimedPageIdxes === undefined) {
          validatorMap.set(validatorAddress, pageIndexes);
        } else {
          validatorMap.set(
            validatorAddress,
            new Set([...validatorClaimedPageIdxes, ...pageIndexes]),
          );
        }

        return claimedRewardsMap;
      }, new Map<number, Map<string, Set<number>>>()),
    ),
  );
