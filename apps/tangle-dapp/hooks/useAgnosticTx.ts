import { assert } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import { useCallback } from 'react';

import { TxName } from '../constants';
import { Precompile } from '../constants/evmPrecompiles';
import useActiveAccountAddress from './useActiveAccountAddress';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import useEvmPrecompileAbiCall, {
  EvmAbiCallData,
  EvmTxFactory,
} from './useEvmPrecompileAbiCall';
import useSubstrateTx, { SubstrateTxFactory, TxStatus } from './useSubstrateTx';
import useTxNotification from './useTxNotification';

export type AgnosticTxOptions<PrecompileT extends Precompile, Context> = {
  precompile: PrecompileT;
  evmTxFactory:
    | EvmTxFactory<PrecompileT, Context>
    | EvmAbiCallData<PrecompileT>;
  substrateTxFactory: SubstrateTxFactory<Context>;

  /**
   * An identifiable name shown on the toast notification to
   * let users know which transaction status updates refer to.
   *
   * Also used to close the notification when the transaction
   * is successful or fails.
   */
  name: TxName;
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
}: AgnosticTxOptions<PrecompileT, Context>) {
  const activeAccountAddress = useActiveAccountAddress();
  const { isEvm: isEvmAccount } = useAgnosticAccountInfo();

  const { notifyProcessing, notifySuccess, notifyError } =
    useTxNotification(name);

  const {
    execute: executeSubstrateTx,
    status: substrateTxStatus,
    error: substrateError,
    reset: substrateReset,
  } = useSubstrateTx(substrateTxFactory, false);

  const {
    execute: executeEvmPrecompileAbiCall,
    status: evmTxStatus,
    error: evmError,
    reset: evmReset,
  } = useEvmPrecompileAbiCall(precompile, evmTxFactory);

  const execute = useCallback(
    async (context: Context) => {
      notifyProcessing();

      let result: HexString | null | Error;

      if (executeEvmPrecompileAbiCall !== null) {
        result = await executeEvmPrecompileAbiCall(context);
      } else {
        // By this point, at least one of the executors should be defined,
        // otherwise it constitutes a logic error.
        assert(
          executeSubstrateTx !== null,
          'Substrate transaction executor should be defined if EVM transaction executor is not'
        );

        result = await executeSubstrateTx(context);
      }

      if (typeof result === 'string') {
        notifySuccess(result);
      } else if (result instanceof Error) {
        notifyError(result);
      }
    },
    [
      executeEvmPrecompileAbiCall,
      executeSubstrateTx,
      notifyError,
      notifyProcessing,
      notifySuccess,
    ]
  );

  const agnosticStatus =
    isEvmAccount === null
      ? TxStatus.NOT_YET_INITIATED
      : isEvmAccount
      ? evmTxStatus
      : substrateTxStatus;

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
