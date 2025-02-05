import { assert } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';

import { TxName } from '../constants';
import { GetSuccessMessageFn } from '../types';
import useEvmPrecompileCall, {
  PrecompileCall,
  EvmTxFactory,
} from './useEvmPrecompileCall';
import useSubstrateTx, { SubstrateTxFactory, TxStatus } from './useSubstrateTx';
import useTxNotification from './useTxNotification';
import { AbiFunction } from 'viem';
import {
  ExtractAbiFunctionNames,
  PrecompileAddress,
} from '../constants/evmPrecompiles';
import useActiveAccountAddress from '@webb-tools/tangle-shared-ui/hooks/useActiveAccountAddress';
import useAgnosticAccountInfo from '@webb-tools/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';

export type AgnosticTxOptions<
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
  Context,
> = {
  abi: Abi;
  precompileAddress: PrecompileAddress;
  substrateTxFactory: SubstrateTxFactory<Context>;

  evmTxFactory:
    | EvmTxFactory<Abi, FunctionName, Context>
    | PrecompileCall<Abi, FunctionName>;

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
  getSuccessMessage?: GetSuccessMessageFn<Context>;
};

/**
 * Enables the execution of a transaction that can be either a Substrate
 * transaction or an EVM precompile ABI call.
 *
 * This effectively abstracts away the handling of actions of Substrate
 * and EVM accounts.
 */
function useAgnosticTx<
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
  Context = void,
>({
  abi,
  precompileAddress,
  evmTxFactory,
  substrateTxFactory,
  name,
  getSuccessMessage,
}: AgnosticTxOptions<Abi, FunctionName, Context>) {
  const [agnosticStatus, setAgnosticStatus] = useState(
    TxStatus.NOT_YET_INITIATED,
  );

  const activeAccountAddress = useActiveAccountAddress();
  const { isEvm: isEvmAccount } = useAgnosticAccountInfo();

  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network.createExplorerTxUrl,
  );

  const {
    execute: executeSubstrateTx,
    status: substrateTxStatus,
    error: substrateError,
    reset: substrateReset,
    txHash: substrateTxHash,
    txBlockHash: substrateTxBlockHash,
    successMessage: substrateSuccessMessage,
  } = useSubstrateTx(substrateTxFactory, getSuccessMessage);

  const {
    execute: executeEvmPrecompileAbiCall,
    status: evmTxStatus,
    error: evmError,
    reset: evmReset,
    txHash: evmTxHash,
    successMessage: evmSuccessMessage,
  } = useEvmPrecompileCall(abi, precompileAddress, evmTxFactory);

  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification();

  const execute = useCallback(
    async (context: Context) => {
      notifyProcessing(name);

      if (executeEvmPrecompileAbiCall !== null) {
        await executeEvmPrecompileAbiCall(context);
      } else {
        // By this point, at least one of the executors should be defined,
        // otherwise it constitutes a logic error.
        assert(
          executeSubstrateTx !== null,
          'Substrate transaction executor should be defined if EVM transaction executor is not',
        );

        await executeSubstrateTx(context);
      }
    },
    [executeEvmPrecompileAbiCall, executeSubstrateTx, name, notifyProcessing],
  );

  // Special effect that handles when an account is disconnected,
  // and prevents the same transaction status from being notified
  // multiple times.
  useEffect(() => {
    const nextAgnosticStatus =
      isEvmAccount === null
        ? null
        : isEvmAccount
          ? evmTxStatus
          : substrateTxStatus;

    // When an account is disconnected, reset the transaction status.
    if (nextAgnosticStatus === null) {
      substrateReset();
      evmReset();
      setAgnosticStatus(TxStatus.NOT_YET_INITIATED);
    }
    // Only update the transaction status when it changes.
    else if (nextAgnosticStatus !== agnosticStatus) {
      setAgnosticStatus(nextAgnosticStatus);
    }
  }, [
    agnosticStatus,
    evmReset,
    evmTxStatus,
    isEvmAccount,
    substrateReset,
    substrateTxStatus,
  ]);

  // Notify transaction status updates via a toast notification.
  useEffect(() => {
    // Transaction is processing or not yet initiated.
    if (
      isEvmAccount === null ||
      agnosticStatus === TxStatus.PROCESSING ||
      agnosticStatus === TxStatus.NOT_YET_INITIATED
    ) {
      return;
    }

    const error = isEvmAccount ? evmError : substrateError;
    const txHash = isEvmAccount ? evmTxHash : substrateTxHash;

    if (error !== null) {
      notifyError(name, error);
    }
    // NOTE: It is totally possible for both to be null, as
    // React's setState is asynchronous and the state might
    // not have been updated yet.
    else if (txHash !== null) {
      const successMessage = isEvmAccount
        ? evmSuccessMessage
        : substrateSuccessMessage;

      const explorerUrl = createExplorerTxUrl(
        false,
        txHash,
        substrateTxBlockHash ?? undefined,
      );

      notifySuccess(name, explorerUrl, successMessage);
    }

    // Only execute effect when the transaction status changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agnosticStatus]);

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
