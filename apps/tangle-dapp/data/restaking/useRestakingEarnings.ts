import { Option } from '@polkadot/types';
import {
  PalletStakingValidatorPrefs,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { firstValueFrom, map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import usePromise from '../../hooks/usePromise';
import convertRewardPointsToReward from '../../utils/convertRewardPointsToReward';

/**
 * Type for the restaking earnings record,
 * key is the era number and value is the restaking earnings for that era
 */
export type EarningRecord = Record<number, number>;

function useRestakingEarnings() {
  const {
    data: dataPromise,
    isLoading: rxLoading,
    error: rxError,
  } = usePolkadotApiRx(
    useCallback((apiRx, activeAccount) => {
      if (!apiRx.query.roles.erasRestakeRewardPoints) {
        return null;
      }

      const accountId32 = apiRx.createType('AccountId', activeAccount);

      return apiRx.query.roles.erasRestakeRewardPoints.entries().pipe(
        map(async (rewardPointsEntries) => {
          const rewardsRecord: EarningRecord = {};

          // Following the `do_payout_stakers` logic in the tangle
          // to convert the reward points to rewards
          // see https://github.com/webb-tools/tangle/blob/8c1be851059d21fe524ca30808219d5b26c01713/pallets/roles/src/functions.rs#L508-L539
          await Promise.all(
            rewardPointsEntries.map(async ([era, rewardPoints]) => {
              // The total pay
              const validatorTotalPayout =
                rewardPoints.individual.get(accountId32);

              if (!validatorTotalPayout) {
                return;
              }

              const [optionalExposure, validatorPrefs] = await firstValueFrom(
                apiRx.queryMulti<
                  [
                    Option<SpStakingPagedExposureMetadata>,
                    PalletStakingValidatorPrefs
                  ]
                >([
                  [apiRx.query.staking.erasStakersOverview, era, accountId32],
                  [apiRx.query.staking.erasValidatorPrefs, era, accountId32],
                ])
              );

              if (optionalExposure.isNone || validatorPrefs.isEmpty) {
                return;
              }

              const exposure = optionalExposure.unwrap();

              const eraNum = era.args[0].toNumber();

              rewardsRecord[eraNum] = convertRewardPointsToReward(
                validatorTotalPayout,
                validatorPrefs.commission.unwrap(),
                exposure.own.unwrap(),
                exposure.total.unwrap()
              );
            })
          );

          return rewardsRecord;
        })
      );
    }, [])
  );

  console.log({
    dataPromise,
    rxLoading,
    rxError,
  });

  const {
    result: data,
    isLoading: promiseLoading,
    error: promiseError,
  } = usePromise(
    () => (dataPromise === null ? Promise.resolve(null) : dataPromise),
    null
  );

  console.log({
    data,
    promiseLoading,
    promiseError,
  });

  return {
    data,
    isLoading: rxLoading || promiseLoading,
    error: rxError || promiseError,
  };
}

export default useRestakingEarnings;
