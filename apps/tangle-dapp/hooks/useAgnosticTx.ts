import { ISubmittableResult } from '@polkadot/types/types';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { useCallback, useEffect } from 'react';

import {
  AbiFunctionName,
  AbiPrecompileCategory,
} from '../constants/evmPrecompiles';
import prepareTxNotification from '../utils/prepareTxNotification';
import useEvmPrecompileAbiCall from './useEvmPrecompileAbiCall';
import useSubstrateTx, { TxFactory, TxStatus } from './useSubstrateTx';

function useAgnosticTx<
  EvmPrecompileCategory extends AbiPrecompileCategory,
  SubstrateTxResult extends ISubmittableResult
>(
  evmCategory: EvmPrecompileCategory,
  evmTarget: AbiFunctionName<EvmPrecompileCategory>,
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
    useEvmPrecompileAbiCall(evmCategory, evmTarget, evmArguments);

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
    perform,
    status: agnosticStatus,
  };
}

export default useAgnosticTx;
