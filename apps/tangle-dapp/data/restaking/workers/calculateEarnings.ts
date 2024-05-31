import type { Option } from '@polkadot/types';
import type {
  PalletStakingValidatorPrefs,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';

import convertRewardPointsToReward from '../../../utils/convertRewardPointsToReward';
import { getApiPromise } from '../../../utils/polkadot/api';
import type { EarningRecord, ErasRestakeRewardPointsEntry } from '../types';

export async function calculateEarnings(
  rpcUrl: string,
  accountId32: string,
  rewardPointsEntries: ErasRestakeRewardPointsEntry[],
): Promise<EarningRecord> {
  const api = await getApiPromise(rpcUrl);
  const rewardsRecord: EarningRecord = {};

  // Following the `do_payout_stakers` logic in the tangle
  // to convert the reward points to rewards
  // see https://github.com/webb-tools/tangle/blob/8c1be851059d21fe524ca30808219d5b26c01713/pallets/roles/src/functions.rs#L508-L539
  await Promise.all(
    rewardPointsEntries.map(async ([era, rewardPoints]) => {
      // The total pay
      const validatorTotalPayout = rewardPoints.individual[accountId32];

      if (!validatorTotalPayout) {
        return;
      }

      const [optionalExposure, validatorPrefs] = await api.queryMulti<
        [Option<SpStakingPagedExposureMetadata>, PalletStakingValidatorPrefs]
      >([
        [api.query.staking.erasStakersOverview, [era, accountId32]],
        [api.query.staking.erasValidatorPrefs, [era, accountId32]],
      ]);

      if (optionalExposure.isNone) {
        return;
      }

      const exposure = optionalExposure.unwrap();

      rewardsRecord[era] = convertRewardPointsToReward(
        validatorTotalPayout,
        validatorPrefs.commission.unwrap().toNumber(),
        exposure.own.unwrap().toBigInt(),
        exposure.total.unwrap().toBigInt(),
      );
    }),
  );

  return rewardsRecord;
}
