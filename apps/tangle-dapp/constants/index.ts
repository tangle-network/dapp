import {
  StakingRewardsDestination,
  StakingRewardsDestinationDisplayText,
} from '../types';

/**
 * The lock ids are always 8 characters long, due to their representation
 * as a `U8aFixed` in the Substrate runtime. That is why the enum values
 * are all 8 characters long, and may look a bit odd (e.g. `phrelect`, and
 * `vesting ` with a trailing space).
 */
export enum SubstrateLockId {
  VESTING = 'vesting ',
  STAKING = 'staking ',
  ELECTIONS_PHRAGMEN = 'phrelect',
  DEMOCRACY = 'democrac',

  // TODO: Need to account for the other lock types.
  OTHER = '?other',
}

export enum StaticAssetPath {
  RESTAKING_METHOD_INDEPENDENT_DARK = '/static/assets/restaking/method-independent-dark.svg',
  RESTAKING_METHOD_SHARED_DARK = '/static/assets/restaking/method-shared-dark.svg',
  RESTAKING_METHOD_INDEPENDENT_LIGHT = '/static/assets/restaking/method-independent-light.svg',
  RESTAKING_METHOD_SHARED_LIGHT = '/static/assets/restaking/method-shared-light.svg',
  LIQUID_STAKING_TOKEN_ASTAR = '/static/assets/liquidStaking/token-astar.svg',
  LIQUID_STAKING_TOKEN_GLIMMER = '/static/assets/liquidStaking/token-glimmer.svg',
  LIQUID_STAKING_TOKEN_MANTA = '/static/assets/liquidStaking/token-manta.svg',
  LIQUID_STAKING_TOKEN_PHALA = '/static/assets/liquidStaking/token-phala.svg',
  LIQUID_STAKING_TOKEN_POLKADOT = '/static/assets/liquidStaking/token-polkadot.svg',
  LIQUID_STAKING_TANGLE_LOGO = '/static/assets/liquidStaking/tangle-logo.svg',
}

export enum ChartColor {
  BLUE = '#B8D6FF',
  GREEN = '#85DC8E',
  GRAY = '#D3D8E2',
  DARK_GRAY = '#3A3E53',
  YELLOW = '#FFEAA6',
  LAVENDER = '#E7E2FF',
}

export enum TxName {
  PAYOUT_ALL = 'payout all stakers',
  PAYOUT_STAKERS = 'payout stakers',
  VEST = 'vest',
  BOND = 'bond',
  REBOND = 'rebond',
  UNBOND = 'unbond',
  BOND_EXTRA = 'bond extra',
  WITHDRAW_UNBONDED = 'withdraw unbonded',
  SET_PAYEE = 'set payee',
  TRANSFER = 'transfer',
  CHILL = 'chill',
  NOMINATE = 'nominate',
  SETUP_NOMINATOR = 'setup nominator',
  UPDATE_NOMINATOR = 'update nominator',
  WITHDRAW_EVM_BALANCE = 'withdraw',
  UPDATE_RESTAKE_PROFILE = 'update restake profile',
  BRIDGE_TRANSFER = 'bridge transfer',
  MINT = 'mint',
  REDEEM = 'redeem',
}

export const PAYMENT_DESTINATION_OPTIONS: StakingRewardsDestinationDisplayText[] =
  [
    StakingRewardsDestinationDisplayText.STAKED,
    StakingRewardsDestinationDisplayText.STASH,
  ];

export const STAKING_PAYEE_TEXT_TO_VALUE_MAP: Record<
  StakingRewardsDestinationDisplayText,
  StakingRewardsDestination
> = {
  [StakingRewardsDestinationDisplayText.STAKED]:
    StakingRewardsDestination.STAKED,
  [StakingRewardsDestinationDisplayText.STASH]: StakingRewardsDestination.STASH,
  [StakingRewardsDestinationDisplayText.CONTROLLER]:
    StakingRewardsDestination.CONTROLLER,
  [StakingRewardsDestinationDisplayText.ACCOUNT]:
    StakingRewardsDestination.ACCOUNT,
  [StakingRewardsDestinationDisplayText.NONE]: StakingRewardsDestination.NONE,
};

export const STAKING_PAYEE_VALUE_TO_TEXT_MAP: Record<
  StakingRewardsDestination,
  StakingRewardsDestinationDisplayText
> = {
  [StakingRewardsDestination.STAKED]:
    StakingRewardsDestinationDisplayText.STAKED,
  [StakingRewardsDestination.STASH]: StakingRewardsDestinationDisplayText.STASH,
  [StakingRewardsDestination.CONTROLLER]:
    StakingRewardsDestinationDisplayText.CONTROLLER,
  [StakingRewardsDestination.ACCOUNT]:
    StakingRewardsDestinationDisplayText.ACCOUNT,
  [StakingRewardsDestination.NONE]: StakingRewardsDestinationDisplayText.NONE,
};

export const EMPTY_VALUE_PLACEHOLDER = '—';

/**
 * The default debounce delay in milliseconds.
 */
export const DEFAULT_DEBOUNCE_DELAY = 500;
