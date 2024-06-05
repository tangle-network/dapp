import { BN_QUINTILL } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';
import { parseUnits } from 'viem';

const BIG_INT_QUINTILL = BigInt(BN_QUINTILL.toString());

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
  rewardPoints: number,
  validatorCommision: number,
  ownStaked: bigint,
  totalStaked: bigint,
): bigint {
  // Convert Perbill to a number
  const validatorCommission = validatorCommision / 10_000_000 / 100;

  const validatorCommissionPayout = rewardPoints * validatorCommission;

  const validatorLeftoverPayout = rewardPoints - validatorCommissionPayout;

  const validatorExposurePart = Number(
    (ownStaked * BIG_INT_QUINTILL) / totalStaked / BIG_INT_QUINTILL,
  );

  const validatorStakingPayout =
    validatorLeftoverPayout * validatorExposurePart;

  const totalPayout = validatorStakingPayout + validatorCommissionPayout;

  // Scale the total payout to `TANGLE_TOKEN_DECIMALS` decimals
  return parseUnits(totalPayout.toString(), TANGLE_TOKEN_DECIMALS);
}
