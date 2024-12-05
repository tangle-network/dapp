import { StakingRewardsDestination } from '../../types';

export enum StakingEvmPayee {
  STAKED = '0x0000000000000000000000000000000000000000000000000000000000000001',
  STASH = '0x0000000000000000000000000000000000000000000000000000000000000002',
}

export function getEvmPayeeValue(
  rewardsDestination: StakingRewardsDestination,
): StakingEvmPayee | null {
  switch (rewardsDestination) {
    case StakingRewardsDestination.STAKED:
      return StakingEvmPayee.STAKED;
    case StakingRewardsDestination.STASH:
      return StakingEvmPayee.STASH;
    // TODO: Are we missing adding all the EVM addresses for the other reward destinations?
    default:
      return null;
  }
}

export default getEvmPayeeValue;
