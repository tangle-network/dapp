import { Option } from '@polkadot/types';
import {
  PalletStakingValidatorPrefs,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { firstValueFrom, map, of } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import usePromise from '../../hooks/usePromise';
import convertRewardPointsToReward from '../../utils/convertRewardPointsToReward';

/**
 * Calculate the total restaking rewrad for the given era
 * @param era the era number
 */
function useRestakingEraReward(era: number) {
  const {
    data: dataPromise,
    isLoading: rxLoading,
    error: rxError,
  } = usePolkadotApiRx(
    useCallback(
      (apiRx) => {
        if (!apiRx.query.roles.erasRestakeRewardPoints) {
          return of(null);
        }

        return apiRx.query.roles.erasRestakeRewardPoints(era).pipe(
          map(async (rewardPoints) => {
            const individuals = rewardPoints.individual.entries();

            let eraReward = 0;

            for (const [accountId, rewardPoints] of individuals) {
              const [optionalExposure, validatorPrefs] = await firstValueFrom(
                apiRx.queryMulti<
                  [
                    Option<SpStakingPagedExposureMetadata>,
                    PalletStakingValidatorPrefs
                  ]
                >([
                  [apiRx.query.staking.erasStakersOverview, era, accountId],
                  [apiRx.query.staking.erasValidatorPrefs, era, accountId],
                ])
              );

              if (optionalExposure.isNone || validatorPrefs.isEmpty) {
                return null;
              }

              const exposure = optionalExposure.unwrap();

              eraReward += convertRewardPointsToReward(
                rewardPoints,
                validatorPrefs.commission.unwrap(),
                exposure.own.unwrap(),
                exposure.total.unwrap()
              );
            }

            return eraReward;
          })
        );
      },
      [era]
    )
  );

  const {
    result: data,
    isLoading: promiseLoading,
    error: promiseError,
  } = usePromise(
    () => (dataPromise === null ? Promise.resolve(null) : dataPromise),
    null
  );

  return {
    data,
    isLoading: rxLoading || promiseLoading,
    error: rxError || promiseError,
  };
}

export default useRestakingEraReward;
