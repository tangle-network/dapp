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

  // Catch-all lock id for runtime lock types not explicitly enumerated above.
  OTHER = '?other',
}

export enum StaticAssetPath {
  STAKING_METHOD_INDEPENDENT_DARK = '/static/assets/staking/method-independent-dark.svg',
  STAKING_METHOD_SHARED_DARK = '/static/assets/staking/method-shared-dark.svg',
  STAKING_METHOD_INDEPENDENT_LIGHT = '/static/assets/staking/method-independent-light.svg',
  STAKING_METHOD_SHARED_LIGHT = '/static/assets/staking/method-shared-light.svg',
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
  UPDATE_STAKING_PROFILE = 'update stake profile',
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
  STAKING_JOIN_OPERATORS = 'join operators',
  STAKING_DEPOSIT = 'stake deposit',
  STAKING_DELEGATE = 'stake delegate',
  STAKING_UNSTAKE = 'stake undelegate',
  STAKING_WITHDRAW = 'stake withdraw',
  STAKING_CANCEL_UNSTAKE = 'stake cancel undelegate',
  STAKING_EXECUTE_UNSTAKE = 'stake execute undelegate',
  STAKING_EXECUTE_WITHDRAW = 'stake execute withdraw',
  STAKING_CANCEL_WITHDRAW = 'stake cancel withdraw',
  CLAIM_REWARDS = 'claim rewards',
  CLAIM_CREDITS = 'claim credits',
  DEMOCRACY_UNLOCK = 'unlock democracy',
  STAKING_NATIVE_DELEGATE = 'native staking delegate nomination',
  STAKING_NATIVE_UNSTAKE = 'native staking undelegate',
  STAKING_NATIVE_UNSTAKE_EXECUTE = 'native staking execute undelegate',
  STAKING_DEPOSITED_UNSTAKE_EXECUTE = 'native staking execute undelegate deposited',
  STAKING_NATIVE_UNSTAKE_CANCEL = 'native staking cancel undelegate',
  STAKING_UNSTAKE_EXECUTE_ALL = 'native staking execute all undelegate',
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

export enum StakingTab {
  STAKING = 'staking',
  VAULTS = 'vaults',
  REWARDS = 'rewards',
  OPERATORS = 'operators',
  BLUEPRINTS = 'blueprints',
}

export enum StakingAction {
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

export enum LiquidStakingTab {
  STAKE = 'stake',
  VAULTS = 'vaults',
  POSITIONS = 'positions',
}

export enum LiquidStakingAction {
  DEPOSIT = 'deposit',
  REDEEM = 'redeem',
  CREATE_VAULT = 'create-vault',
}

export const ERROR_NOT_ENOUGH_BALANCE = 'Not enough available balance';
