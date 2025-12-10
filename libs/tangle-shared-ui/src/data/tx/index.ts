/**
 * Transaction hooks for the v2 EVM contracts.
 * These replace the Substrate-based transaction hooks.
 */

// Deposit
export { useDepositTx, type DepositParams } from './useDepositTx';

// Delegate
export { useDelegateTx, type DelegateParams } from './useDelegateTx';

// Undelegate (unstake)
export {
  useScheduleUnstakeTx,
  useExecuteUnstakeTx,
  type ScheduleUnstakeParams,
} from './useUndelegateTx';

// Withdraw
export {
  useScheduleWithdrawTx,
  useExecuteWithdrawTx,
  type ScheduleWithdrawParams,
} from './useWithdrawTx';

// Re-export the base hook
export { default as useContractWrite, TxStatus, type TxResult } from '../../hooks/useContractWrite';
