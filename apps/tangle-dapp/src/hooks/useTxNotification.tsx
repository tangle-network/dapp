import { TxName } from '../constants';
import useSharedTxNotification from '@tangle-network/tangle-shared-ui/hooks/useTxNotification';

const SUCCESS_MESSAGES: Record<TxName, string> = {
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

const useTxNotification = () => {
  const { notifyProcessing, notifySuccess, notifyError } = useSharedTxNotification(SUCCESS_MESSAGES);
  return { notifyProcessing, notifySuccess, notifyError };
};

export default useTxNotification;
