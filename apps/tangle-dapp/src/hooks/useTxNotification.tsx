import { TxName } from '../constants';
import useSharedTxNotification from '@tangle-network/tangle-shared-ui/hooks/useTxNotification';

export const SUCCESS_MESSAGES: Record<TxName, string> = {
  [TxName.BOND]: 'Bonded tokens into staking',
  [TxName.BOND_EXTRA]: 'Added more tokens to existing stake',
  [TxName.UNBOND]: 'Unbonded tokens from staking',
  [TxName.REBOND]: 'Rebonded tokens into staking',
  [TxName.WITHDRAW_UNBONDED]: 'Withdrew all unbonded tokens',
  [TxName.CHILL]: 'Stopped nominating validators',
  [TxName.NOMINATE]: 'Nominated validators for staking',
  [TxName.PAYOUT_STAKERS]: 'Payout completed successfully',
  [TxName.PAYOUT_STAKERS_ALL]: 'Payout executed for all stakers',
  [TxName.SET_PAYEE]: 'Updated staking payout reward destination',
  [TxName.VEST]: 'Released vested tokens',
  [TxName.TRANSFER]: 'Transfer completed successfully',
  [TxName.SETUP_NOMINATOR]: 'Nominator setup completed successfully',
  [TxName.UPDATE_NOMINATOR]: 'Nominator updated successfully',
  [TxName.WITHDRAW_EVM_BALANCE]: 'Withdrawal completed successfully',
  [TxName.UPDATE_RESTAKE_PROFILE]: 'Restake profile updated successfully',
  [TxName.LST_REBOND]: 'Unstake request cancelled',
  [TxName.LS_TANGLE_POOL_SET_STATE]: 'Pool state updated successfully',
  [TxName.LS_WITHDRAW_UNBONDED]: 'Unstake request executed',
  [TxName.LST_UPDATE_COMMISSION]: 'Updated commission rate successfully',
  [TxName.LS_LIQUIFIER_DEPOSIT]: 'Liquifier deposit completed successfully',
  [TxName.LS_LIQUIFIER_APPROVE]: 'Liquifier approval completed successfully',
  [TxName.LS_LIQUIFIER_UNLOCK]: 'Liquifier unlock completed successfully',
  [TxName.LS_LIQUIFIER_WITHDRAW]: 'Liquifier withdrawal completed successfully',
  [TxName.LS_TANGLE_POOL_JOIN]: 'Joined liquid staking pool',
  [TxName.LS_TANGLE_POOL_UNBOND]: 'Unbonded from liquid staking pool',
  [TxName.LS_TANGLE_POOL_CREATE]: 'Created liquid staking pool',
  [TxName.LS_TANGLE_POOL_UPDATE_ROLES]: 'Updated pool roles successfully',
  [TxName.LS_TANGLE_POOL_UPDATE_NOMINATIONS]:
    'Updated pool nominations successfully',
  [TxName.RESTAKE_JOIN_OPERATORS]: 'Joined as an operator',
  [TxName.RESTAKE_DEPOSIT]: 'Deposited tokens successfully',
  [TxName.RESTAKE_DELEGATE]: 'Delegated tokens successfully',
  [TxName.RESTAKE_UNSTAKE]: 'Scheduled undelegate request',
  [TxName.RESTAKE_WITHDRAW]: 'Scheduled withdrawal request',
  [TxName.RESTAKE_CANCEL_UNSTAKE]: 'Cancelled undelegate request(s)',
  [TxName.RESTAKE_EXECUTE_UNSTAKE]: 'Executed undelegate request',
  [TxName.RESTAKE_EXECUTE_WITHDRAW]: 'Executed withdraw request',
  [TxName.RESTAKE_CANCEL_WITHDRAW]: 'Cancelled withdraw request(s)',
  [TxName.CLAIM_REWARDS]: 'Claimed rewards successfully',
  [TxName.CLAIM_CREDITS]: 'Claimed credits successfully',
  [TxName.DEMOCRACY_UNLOCK]: 'Unlocked democracy tokens',
  [TxName.RESTAKE_NATIVE_DELEGATE]: 'Restaked native tokens successfully',
  [TxName.RESTAKE_NATIVE_UNSTAKE]: 'Scheduled undelegate request',
  [TxName.RESTAKE_NATIVE_UNSTAKE_EXECUTE]: 'Executed undelegate request(s)',
  [TxName.RESTAKE_DEPOSITED_UNSTAKE_EXECUTE]: 'Executed undelegate request(s)',
  [TxName.RESTAKE_NATIVE_UNSTAKE_CANCEL]: 'Cancelled undelegate request(s)',
  [TxName.RESTAKE_UNSTAKE_EXECUTE_ALL]: 'Executed all undelegate requests',
};

const useTxNotification = () => {
  const { notifyProcessing, notifySuccess, notifyError } =
    useSharedTxNotification(SUCCESS_MESSAGES);
  return { notifyProcessing, notifySuccess, notifyError };
};

export { useTxNotification as default };
