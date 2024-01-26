import { ISubmittableResult } from '@polkadot/types/types';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useEffect } from 'react';

import { AbiFunctionName, Precompile } from '../constants/evmPrecompiles';
import prepareTxNotification from '../utils/prepareTxNotification';
import useEvmPrecompileAbiCall from './useEvmPrecompileAbiCall';
import useSubstrateTx, { TxFactory, TxStatus } from './useSubstrateTx';

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
>(
  precompile: PrecompileT,
  evmTarget: AbiFunctionName<PrecompileT>,
  evmArguments: unknown[],
  substrateTxFactory: TxFactory<SubstrateTxResult>,
  notifyStatusUpdates = false
) {
  const activeAccount = useActiveAccount();
  const activeAccountAddress = activeAccount[0]?.address ?? null;
  const { notificationApi } = useWebbUI();

  const { perform: performSubstrateTx, status: substrateTxStatus } =
    useSubstrateTx(substrateTxFactory);

  const { perform: performEvmPrecompileAbiCall, status: evmTxStatus } =
    useEvmPrecompileAbiCall(precompile, evmTarget, evmArguments);

  const isEvmAccount =
    activeAccountAddress === null
      ? null
      : isEthereumAddress(activeAccountAddress);

  const agnosticStatus =
    isEvmAccount === null
      ? TxStatus.NotYetInitiated
      : isEvmAccount
      ? evmTxStatus
      : substrateTxStatus;

  // Notify the user of the transaction status, if applicable.
  useEffect(() => {
    if (
      isEvmAccount === null ||
      agnosticStatus === TxStatus.NotYetInitiated ||
      !notifyStatusUpdates
    ) {
      return;
    }

    const notificationOpts = prepareTxNotification(agnosticStatus, null);

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
  ]);

  const perform = useCallback(async () => {
    if (activeAccountAddress === null || isEvmAccount === null) {
      return;
    }

    return isEvmAccount ? performEvmPrecompileAbiCall() : performSubstrateTx();
  }, [
    activeAccountAddress,
    isEvmAccount,
    performEvmPrecompileAbiCall,
    performSubstrateTx,
  ]);

  return {
    perform: () => void perform(),
    status: agnosticStatus,
  };
}

export default useAgnosticTx;
