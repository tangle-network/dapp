import type { u32, u128 } from '@polkadot/types';
import type { Perbill } from '@polkadot/types/interfaces';
import { type BN, BN_MILLION } from '@polkadot/util';

/**
 * Convert the reward points to reward in token
 * Following the `do_payout_stakers` logic in the tangle
 * to convert the reward points to rewards
 * see https://github.com/webb-tools/tangle/blob/8c1be851059d21fe524ca30808219d5b26c01713/pallets/roles/src/functions.rs#L508-L539
 * @param rewardPoints the reward points (got from `api.query.roles.erasRestakeRewardPoints`)
 * @param validatorCommision the validator commission (got from `api.query.staking.erasValidatorPrefs`)
 * @param ownStaked the own staked amount of the validator (got from `api.query.staking.erasStakersOverview`)
 * @param totalStaked the total staked amount of the validator (got from `api.query.staking.erasStakersOverview`)
 * @returns the reward in token
 */
export default function convertRewardPointsToReward(
  rewardPoints: u32,
  validatorCommision: Perbill,
  ownStaked: u128,
  totalStaked: u128
): BN {
  // Convert Perbill to a number
  const validatorCommission = validatorCommision.toNumber() / 10_000_000 / 100;

  const validatorCommissionPayout = rewardPoints.muln(validatorCommission);

  const validatorLeftoverPayout = rewardPoints.sub(validatorCommissionPayout);

  const validatorExposurePart =
    ownStaked.mul(BN_MILLION).div(totalStaked).toNumber() /
    BN_MILLION.toNumber();

  const validatorStakingPayout = validatorLeftoverPayout.muln(
    validatorExposurePart
  );

  return validatorStakingPayout.add(validatorCommissionPayout);
}
