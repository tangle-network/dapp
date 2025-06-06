import assertRestakeAssetId from '../utils/assertRestakeAssetId';

export const NATIVE_ASSET_ID = assertRestakeAssetId('0');

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
}

export const SUCCESS_MESSAGES: Record<TxName, string> = {
  [TxName.BOND]: 'Bonded tokens into staking',
  [TxName.BOND_EXTRA]: 'Added more tokens to existing stake',
  [TxName.UNBOND]: 'Unbonded tokens from staking',
  [TxName.REBOND]: 'Rebonded tokens into staking',
  [TxName.WITHDRAW_UNBONDED]: 'Withdrew all unbonded tokens',
  [TxName.CHILL]: 'Stopped nominating',
  [TxName.NOMINATE]: 'Nominated validators for staking',
  [TxName.PAYOUT_STAKERS]: 'Payout was successful',
  [TxName.PAYOUT_STAKERS_ALL]: 'Payout executed for all stakers',
  [TxName.SET_PAYEE]: 'Updated staking payout reward destination',
  [TxName.VEST]: 'Released vested tokens',
  [TxName.TRANSFER]: 'Transfer successful',
  [TxName.SETUP_NOMINATOR]: 'Nominator setup successful',
  [TxName.UPDATE_NOMINATOR]: 'Nominator updated',
  [TxName.WITHDRAW_EVM_BALANCE]: 'Withdrawal successful',
  [TxName.UPDATE_RESTAKE_PROFILE]: 'Restake profile updated',
  [TxName.LST_REBOND]: 'Unstake request cancelled',
  [TxName.LS_TANGLE_POOL_SET_STATE]: 'Pool state updated',
  [TxName.LS_WITHDRAW_UNBONDED]: 'Unstake request executed',
  [TxName.LST_UPDATE_COMMISSION]: 'Updated commission rate',
  [TxName.LS_LIQUIFIER_DEPOSIT]: 'Liquifier deposit successful',
  [TxName.LS_LIQUIFIER_APPROVE]: 'Liquifier approval successful',
  [TxName.LS_LIQUIFIER_UNLOCK]: 'Liquifier unlock successful',
  [TxName.LS_LIQUIFIER_WITHDRAW]: 'Liquifier withdrawal successful',
  [TxName.LS_TANGLE_POOL_JOIN]: 'Joined liquid staking pool',
  [TxName.LS_TANGLE_POOL_UNBOND]: 'Unbonded from liquid staking pool',
  [TxName.LS_TANGLE_POOL_CREATE]: 'Created liquid staking pool',
  [TxName.LS_TANGLE_POOL_UPDATE_ROLES]: 'Updated pool roles',
  [TxName.LS_TANGLE_POOL_UPDATE_NOMINATIONS]: 'Updated pool nominations',
  [TxName.RESTAKE_JOIN_OPERATORS]: 'Joined as an operator',
  [TxName.RESTAKE_DEPOSIT]: 'Deposited tokens',
  [TxName.RESTAKE_DELEGATE]: 'Delegated tokens',
  [TxName.RESTAKE_UNSTAKE]: 'Scheduled undelegate request',
  [TxName.RESTAKE_WITHDRAW]: 'Withdrawal scheduled',
  [TxName.RESTAKE_CANCEL_UNSTAKE]: 'Undelegate request(s) cancelled',
  [TxName.RESTAKE_EXECUTE_UNSTAKE]: 'Undelegate request executed',
  [TxName.RESTAKE_EXECUTE_WITHDRAW]: 'Withdraw request executed',
  [TxName.RESTAKE_CANCEL_WITHDRAW]: 'Withdraw request(s) cancelled',
  [TxName.CLAIM_REWARDS]: 'Claimed rewards',
  [TxName.DEMOCRACY_UNLOCK]: 'Democracy tokens unlocked',
  [TxName.RESTAKE_NATIVE_DELEGATE]: 'Restaked native tokens',
  [TxName.RESTAKE_NATIVE_UNSTAKE]: 'Scheduled undelegate request',
  [TxName.RESTAKE_NATIVE_UNSTAKE_EXECUTE]: 'Undelegate request(s) executed',
  [TxName.RESTAKE_NATIVE_UNSTAKE_CANCEL]: 'Undelegate request(s) cancelled',
};
