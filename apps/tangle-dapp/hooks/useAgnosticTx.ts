import { ISubmittableResult } from '@polkadot/types/types';
import { assert } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useEffect } from 'react';

import { AbiFunctionName, Precompile } from '../constants/evmPrecompiles';
import prepareTxNotification from '../utils/prepareTxNotification';
import useActiveAccountAddress from './useActiveAccountAddress';
import useEvmPrecompileAbiCall from './useEvmPrecompileAbiCall';
import useSubstrateTx, { TxFactory, TxStatus } from './useSubstrateTx';

export type AgnosticTxOptions<
  PrecompileT extends Precompile,
  SubstrateTxResult extends ISubmittableResult
> = {
  precompile: PrecompileT;
  evmTarget: AbiFunctionName<PrecompileT>;
  // TODO: Add typing for precompile arguments.
  evmArguments: unknown[];
  substrateTxFactory: TxFactory<SubstrateTxResult>;
  notifyStatusUpdates?: boolean;
};

/**
 * Enables the execution of a transaction that can be either a Substrate
 * transaction or an EVM precompile ABI call.
 *
 * This effectively abstracts away the handling of actions of Substrate
 * and EVM accounts.
 */
function useAgnosticTx<
  PrecompileT extends Precompile,
  SubstrateTxResult extends ISubmittableResult
>({
  precompile,
  evmTarget,
  evmArguments,
  substrateTxFactory,
  notifyStatusUpdates = true,
}: AgnosticTxOptions<PrecompileT, SubstrateTxResult>) {
  const activeAccountAddress = useActiveAccountAddress();
  const { notificationApi } = useWebbUI();

  const {
    execute: executeSubstrateTx,
    status: substrateTxStatus,
    error: substrateError,
  } = useSubstrateTx(substrateTxFactory);

  const {
    execute: executeEvmPrecompileAbiCall,
    status: evmTxStatus,
    error: evmError,
  } = useEvmPrecompileAbiCall(precompile, evmTarget, evmArguments);

  const isEvmAccount =
    activeAccountAddress === null
      ? null
      : isEthereumAddress(activeAccountAddress);

  const agnosticStatus =
    isEvmAccount === null
      ? TxStatus.NOT_YET_INITIATED
      : isEvmAccount
      ? evmTxStatus
      : substrateTxStatus;

  const agnosticError =
    isEvmAccount === null ? null : isEvmAccount ? evmError : substrateError;

  // Notify the user of the transaction status, if applicable.
  useEffect(() => {
    if (
      isEvmAccount === null ||
      agnosticStatus === TxStatus.NOT_YET_INITIATED ||
      !notifyStatusUpdates
    ) {
      return;
    }

    const notificationOpts = prepareTxNotification(
      agnosticStatus,
      agnosticError
    );

    if (notificationOpts === null) {
      return;
    }

    notificationApi(notificationOpts);
  }, [
    substrateTxStatus,
    evmTxStatus,
    isEvmAccount,
    notificationApi,
    agnosticStatus,
    notifyStatusUpdates,
    agnosticError,
  ]);

  const execute = useCallback(async () => {
    if (executeEvmPrecompileAbiCall !== null) {
      return executeEvmPrecompileAbiCall();
    } else if (executeSubstrateTx !== null) {
      return executeSubstrateTx();
    }

    // By this point, at least one of the executors should be defined,
    // otherwise it constitutes a logic error.
    assert(
      executeSubstrateTx !== null,
      'Substrate transaction executor should be defined if EVM transaction executor is not'
    );
  }, [executeEvmPrecompileAbiCall, executeSubstrateTx]);

  return {
    status: agnosticStatus,
    error:
      isEvmAccount === null ? null : isEvmAccount ? evmError : substrateError,
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
