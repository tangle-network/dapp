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
  DELEGATE = 'delegate',

  // TODO: Need to account for the other lock types.
  OTHER = '?other',
}

export enum StaticAssetPath {
  RESTAKING_METHOD_INDEPENDENT_DARK = '/static/assets/restaking/method-independent-dark.svg',
  RESTAKING_METHOD_SHARED_DARK = '/static/assets/restaking/method-shared-dark.svg',
  RESTAKING_METHOD_INDEPENDENT_LIGHT = '/static/assets/restaking/method-independent-light.svg',
  RESTAKING_METHOD_SHARED_LIGHT = '/static/assets/restaking/method-shared-light.svg',
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
  PAYOUT_STAKERS_ALL = 'payout all stakers',
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
  LST_REBOND = 'cancel unstake request',
  LS_WITHDRAW_UNBONDED = 'withdraw unbonded tokens',
  LST_UPDATE_COMMISSION = 'update commission',
  LS_LIQUIFIER_APPROVE = 'approve spending for liquifier',
  LS_LIQUIFIER_DEPOSIT = 'liquifier deposit',
  LS_LIQUIFIER_UNLOCK = 'liquifier unlock',
  LS_LIQUIFIER_WITHDRAW = 'liquifier withdraw',
  LS_TANGLE_POOL_JOIN = 'join liquid staking pool',
  LS_TANGLE_POOL_UNBOND = 'unstake from liquid staking pool',
  LS_TANGLE_POOL_CREATE = 'create liquid staking pool',
  LS_TANGLE_POOL_UPDATE_ROLES = 'update pool roles',
  LS_TANGLE_POOL_SET_STATE = 'set pool state',
  LS_TANGLE_POOL_UPDATE_NOMINATIONS = 'update pool nominations',
  RESTAKE_JOIN_OPERATORS = 'join operators',
  RESTAKE_DEPOSIT = 'restake deposit',
  RESTAKE_DELEGATE = 'restake delegate',
  RESTAKE_UNSTAKE = 'restake undelegate',
  RESTAKE_WITHDRAW = 'restake withdraw',
  RESTAKE_CANCEL_UNSTAKE = 'restake cancel undelegate',
  RESTAKE_EXECUTE_UNSTAKE = 'restake execute undelegate',
  RESTAKE_EXECUTE_WITHDRAW = 'restake execute withdraw',
  RESTAKE_CANCEL_WITHDRAW = 'restake cancel withdraw',
  CLAIM_REWARDS = 'claim rewards',
  DEMOCRACY_UNLOCK = 'unlock democracy',
  RESTAKE_NATIVE_DELEGATE = 'restake delegate nomination',
  RESTAKE_NATIVE_UNSTAKE = 'restake undelegate native',
  RESTAKE_NATIVE_UNSTAKE_EXECUTE = 'restake execute undelegate native',
  RESTAKE_NATIVE_UNSTAKE_CANCEL = 'restake cancel undelegate native',
  SERVICES_APPROVE = 'approve service request',
  SERVICES_REJECT = 'reject service request',
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

/**
 * The default debounce delay in milliseconds.
 */
export const DEFAULT_DEBOUNCE_DELAY = 500;

export enum LockUnlocksAtKind {
  ERA,
  BLOCK,
}

export enum RestakeAction {
  DEPOSIT = 'deposit',
  DELEGATE = 'delegate',
  UNDELEGATE = 'undelegate',
  WITHDRAW = 'withdraw',
}

export enum AddressType {
  EVM,
  SUBSTRATE,
  SOLANA,
  SUBSTRATE_OR_EVM,
}

export const ERROR_NOT_ENOUGH_BALANCE = 'Not enough available balance';
