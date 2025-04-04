import { assert } from '@polkadot/util';
import { useCallback, useEffect, useState } from 'react';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import useNetworkStore from '../context/useNetworkStore';
import useActiveAccountAddress from './useActiveAccountAddress';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import { AbiFunction } from 'viem';
import {
  ExtractAbiFunctionNames,
  PrecompileAddress,
} from '../constants/evmPrecompiles';
import type { GetSuccessMessageFn, BaseTxName } from '../types';
import useEvmPrecompileCall, {
  EvmTxFactory,
  PrecompileCall,
} from './useEvmPrecompileCall';
import useSubstrateTx, { SubstrateTxFactory, TxStatus } from './useSubstrateTx';
import useTxNotification from './useTxNotification';

export type AgnosticTxOptions<
  Abi extends AbiFunction[],
  FunctionName extends ExtractAbiFunctionNames<Abi>,
  Context,
  TxName extends BaseTxName,
> = {
  abi: Abi;
  precompileAddress: PrecompileAddress;
  substrateTxFactory: SubstrateTxFactory<Context>;

  evmTxFactory:
    | EvmTxFactory<Abi, FunctionName, Context>
    | PrecompileCall<Abi, FunctionName>;

  /**
   * Whether this specific transaction is eligible for utilizing
   * the transaction relayer to subsidize transaction fees. Other
   * requirements must be met for this to be effective (ex. the balance
   * being zero).
   */
  isEvmTxRelayerSubsidized?: boolean;

  /**
   * An identifiable name shown on the toast notification to
   * let users know which transaction status updates refer to.
   *
   * Also used to close the notification when the transaction
   * is successful or fails.
   */
  name: TxName;

  /**
   * A map of transaction names to success messages.
   *
   * This is used to display a success message on the toast notification.
   */
  successMessageByTxName: Record<TxName, string>;

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
  TxName extends BaseTxName = BaseTxName,
>({
  abi,
  precompileAddress,
  evmTxFactory,
  substrateTxFactory,
  name,
  getSuccessMessage,
  successMessageByTxName,
  isEvmTxRelayerSubsidized = false,
}: AgnosticTxOptions<Abi, FunctionName, Context, TxName>) {
  const [agnosticStatus, setAgnosticStatus] = useState(
    TxStatus.NOT_YET_INITIATED,
  );

  const activeAccountAddress = useActiveAccountAddress();
  const { isEvm: isEvmAccount, isSolana: isSolanaAccount } =
    useAgnosticAccountInfo();

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
  } = useSubstrateTx({ name, factory: substrateTxFactory, getSuccessMessage });

  const {
    execute: executeEvmPrecompileAbiCall,
    status: evmTxStatus,
    error: evmError,
    reset: evmReset,
    txHash: evmTxHash,
    successMessage: evmSuccessMessage,
  } = useEvmPrecompileCall(abi, precompileAddress, evmTxFactory);

  const { notifyProcessing, notifySuccess, notifyError } =
    useTxNotification<TxName>(successMessageByTxName);

  const execute = useCallback(
    async (context: Context) => {
      if (isSolanaAccount) {
        notifyError(name, new Error('Solana transactions are not supported!'));
        return;
      }

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
    [
      executeEvmPrecompileAbiCall,
      executeSubstrateTx,
      isSolanaAccount,
      name,
      notifyError,
      notifyProcessing,
    ],
  );

  // Special effect that handles when an account is disconnected,
  // and prevents the same transaction status from being notified
  // multiple times.
  useEffect(() => {
    if (activeAccountAddress && isSolanaAddress(activeAccountAddress)) {
      return;
    }

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
    activeAccountAddress,
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
      (isEvmAccount === null && !isSolanaAccount) ||
      agnosticStatus === TxStatus.PROCESSING ||
      agnosticStatus === TxStatus.NOT_YET_INITIATED
    ) {
      return;
    }

    if (isSolanaAccount) {
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
        isEvmAccount === true,
        txHash,
        isEvmAccount === true ? undefined : (substrateTxBlockHash ?? undefined),
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
