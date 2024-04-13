import { StakingRewardsDestination } from '../../types';

export enum StakingEvmPayee {
  STAKED = '0x0000000000000000000000000000000000000000000000000000000000000000',
  STASH = '0x0000000000000000000000000000000000000000000000000000000000000001',
  CONTROLLER = '0x0000000000000000000000000000000000000000000000000000000000000002',
}

export function getEvmPayeeValue(
  rewardsDestination: StakingRewardsDestination
): StakingEvmPayee {
  switch (rewardsDestination) {
    case StakingRewardsDestination.CONTROLLER:
      return StakingEvmPayee.CONTROLLER;
    case StakingRewardsDestination.STAKED:
      return StakingEvmPayee.STAKED;
    case StakingRewardsDestination.STASH:
      return StakingEvmPayee.STASH;
  }
}

export default getEvmPayeeValue;
