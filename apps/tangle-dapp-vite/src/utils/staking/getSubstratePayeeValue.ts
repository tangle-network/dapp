import { PalletStakingRewardDestination } from '@polkadot/types/lookup';

import { StakingRewardsDestination } from '../../types';

function getSubstratePayeeValue(
  payee: StakingRewardsDestination,
): PalletStakingRewardDestination['type'] {
  switch (payee) {
    case StakingRewardsDestination.CONTROLLER:
      return 'Controller';
    case StakingRewardsDestination.STASH:
      return 'Stash';
    case StakingRewardsDestination.STAKED:
      return 'Staked';
    case StakingRewardsDestination.ACCOUNT:
      return 'Account';
    case StakingRewardsDestination.NONE:
      return 'None';
  }
}

export default getSubstratePayeeValue;
