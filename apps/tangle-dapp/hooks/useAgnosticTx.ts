import { assert } from '@polkadot/util';
import { useCallback, useEffect } from 'react';

import { TxName } from '../constants';
import { Precompile } from '../constants/evmPrecompiles';
import { GetSuccessMessageFunctionType } from '../types';
import useActiveAccountAddress from './useActiveAccountAddress';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useEvmPrecompileAbiCall, {
  AbiCall,
  EvmTxFactory,
} from './useEvmPrecompileAbiCall';
import useSubstrateTx, { SubstrateTxFactory, TxStatus } from './useSubstrateTx';
import useTxNotification from './useTxNotification';

export type AgnosticTxOptions<PrecompileT extends Precompile, Context> = {
  precompile: PrecompileT;
  evmTxFactory: EvmTxFactory<PrecompileT, Context> | AbiCall<PrecompileT>;
  substrateTxFactory: SubstrateTxFactory<Context>;

  /**
   * An identifiable name shown on the toast notification to
   * let users know which transaction status updates refer to.
   *
   * Also used to close the notification when the transaction
   * is successful or fails.
   */
  name: TxName;

  /**
   * A function that returns a success message to display
   * when the transaction is successful.
   *
   * @param context The context object passed to the `execute` function.
   * @returns The success message to display.
   */
  getSuccessMessageFnc?: GetSuccessMessageFunctionType<Context>;
};

/**
 * Enables the execution of a transaction that can be either a Substrate
 * transaction or an EVM precompile ABI call.
 *
 * This effectively abstracts away the handling of actions of Substrate
 * and EVM accounts.
 */
function useAgnosticTx<PrecompileT extends Precompile, Context = void>({
  precompile,
  evmTxFactory,
  substrateTxFactory,
  name,
  getSuccessMessageFnc,
}: AgnosticTxOptions<PrecompileT, Context>) {
  const activeAccountAddress = useActiveAccountAddress();
  const { isEvm: isEvmAccount } = useAgnosticAccountInfo();

  const {
    execute: executeSubstrateTx,
    status: substrateTxStatus,
    error: substrateError,
    reset: substrateReset,
    txHash: substrateTxHash,
    successMessage: substrateSuccessMessage,
  } = useSubstrateTx(substrateTxFactory, getSuccessMessageFnc);

  const {
    execute: executeEvmPrecompileAbiCall,
    status: evmTxStatus,
    error: evmError,
    reset: evmReset,
    txHash: evmTxHash,
    successMessage: evmSuccessMessage,
  } = useEvmPrecompileAbiCall(precompile, evmTxFactory);

  const { notifyProcessing, notifySuccess, notifyError } =
    useTxNotification(name);

  const execute = useCallback(
    async (context: Context) => {
      notifyProcessing();

      if (executeEvmPrecompileAbiCall !== null) {
        await executeEvmPrecompileAbiCall(context);
      } else {
        // By this point, at least one of the executors should be defined,
        // otherwise it constitutes a logic error.
        assert(
          executeSubstrateTx !== null,
          'Substrate transaction executor should be defined if EVM transaction executor is not'
        );

        await executeSubstrateTx(context);
      }
    },
    [executeEvmPrecompileAbiCall, executeSubstrateTx, notifyProcessing]
  );

  const agnosticStatus =
    isEvmAccount === null
      ? TxStatus.NOT_YET_INITIATED
      : isEvmAccount
      ? evmTxStatus
      : substrateTxStatus;

  // Notify transaction status updates via a toast notification.
  useEffect(() => {
    if (
      agnosticStatus === TxStatus.NOT_YET_INITIATED ||
      agnosticStatus === TxStatus.PROCESSING ||
      isEvmAccount === null
    ) {
      return;
    }

    const error = isEvmAccount ? evmError : substrateError;
    const txHash = isEvmAccount ? evmTxHash : substrateTxHash;

    // NOTE: It is totally possible for both to be null, as
    // React's setState is asynchronous and the state might
    // not have been updated yet.
    if (txHash !== null) {
      notifySuccess(
        txHash,
        isEvmAccount ? evmSuccessMessage : substrateSuccessMessage
      );
    } else if (error !== null) {
      notifyError(error);
    }
  }, [
    agnosticStatus,
    evmError,
    evmTxHash,
    isEvmAccount,
    notifyError,
    notifySuccess,
    substrateError,
    substrateTxHash,
    evmSuccessMessage,
    substrateSuccessMessage,
  ]);

  // Clear notification state when the active account is disconnected,
  // to prevent a bug from re-triggering the notification when an account
  // is re-connected.
  useEffect(() => {
    if (activeAccountAddress === null) {
      substrateReset();
      evmReset();
    }
  }, [activeAccountAddress, evmReset, substrateReset]);

  return {
    status: agnosticStatus,
    error:
      isEvmAccount === null ? null : isEvmAccount ? evmError : substrateError,
    reset:
      isEvmAccount === null ? null : isEvmAccount ? evmReset : substrateReset,
    execute:
      // Only provide the executor when all its requirements are met.
      // This is useful, for example, to force the consumer of this hook
      // to disable the button that triggers the transaction until its
      // requirements are met.
      activeAccountAddress === null ||
      isEvmAccount === null ||
      (executeSubstrateTx === null && executeEvmPrecompileAbiCall === null)
        ? null
        : execute,
  };
}

export default useAgnosticTx;
