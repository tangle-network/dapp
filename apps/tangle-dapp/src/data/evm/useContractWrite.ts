import { HexString } from '@polkadot/util/types';
import { useWebContext } from '@tangle-network/api-provider-environment';
import chainsPopulated from '@tangle-network/dapp-config/chains/chainsPopulated';
import {
  calculateTypedChainId,
  ChainType,
} from '@tangle-network/dapp-types/TypedChainId';
import ensureError from '@tangle-network/tangle-shared-ui/utils/ensureError';
import assert from 'assert';
import { useCallback } from 'react';
import {
  Abi as ViemAbi,
  ContractFunctionArgs,
  ContractFunctionName,
} from 'viem';
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'viem/actions';
import { mainnet, sepolia } from 'viem/chains';
import { useConnectorClient } from 'wagmi';

import { TxName } from '../../constants';
import { IS_PRODUCTION_ENV } from '../../constants/env';
import useEvmAddress20 from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';
import useTxNotification from '../../hooks/useTxNotification';
import { type NotificationSteps } from '@tangle-network/tangle-shared-ui/hooks/useTxNotification';

import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const RECEIPT_TIMEOUT_MS = 180_000;

const isReceiptTimeoutError = (error: Error): boolean => {
  return (
    error.name === 'WaitForTransactionReceiptTimeoutError' ||
    /wait for transaction receipt|timed out|timeout/i.test(error.message)
  );
};

export type ContractWriteOptions<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'nonpayable'>,
> = {
  txName: TxName;
  address: HexString;
  functionName: FunctionName;
  args: ContractFunctionArgs<Abi, 'payable' | 'nonpayable', FunctionName>;
  notificationStep?: NotificationSteps;
};

const useContractWrite = <Abi extends ViemAbi>(abi: Abi) => {
  const { data: connectorClient } = useConnectorClient();
  const activeEvmAddress20 = useEvmAddress20();
  const { activeChain, activeWallet, switchChain } = useWebContext();
  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification();

  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network.createExplorerTxUrl,
  );

  const write = useCallback(
    async <
      FunctionName extends ContractFunctionName<Abi, 'nonpayable' | 'payable'>,
    >(
      options: ContractWriteOptions<Abi, FunctionName>,
    ) => {
      assert(
        connectorClient !== undefined,
        "Should not be able to call this function if the client isn't ready yet",
      );

      assert(
        activeEvmAddress20 !== null,
        'Should not be able to call this function if there is no active EVM account',
      );

      // On development, switch to the Sepolia chain if it's not already active.
      // This is because there are dummy contracts deployed to Sepolia for testing.
      if (
        !IS_PRODUCTION_ENV &&
        activeChain !== null &&
        activeChain !== undefined &&
        activeChain.id !== sepolia.id &&
        activeWallet !== undefined
      ) {
        const typedChainId = calculateTypedChainId(ChainType.EVM, sepolia.id);
        const targetChain = chainsPopulated[typedChainId];

        await switchChain(targetChain, activeWallet);
      }

      notifyProcessing(options.txName, options.notificationStep);

      try {
        const { request } = await simulateContract(connectorClient, {
          chain: IS_PRODUCTION_ENV ? mainnet : sepolia,
          address: options.address,
          functionName: options.functionName,
          account: activeEvmAddress20,
          abi: abi as ViemAbi,
          args: options.args as unknown[],
        });

        const txHash = await writeContract(connectorClient, request);

        const txReceipt = await waitForTransactionReceipt(connectorClient, {
          hash: txHash,
          timeout: RECEIPT_TIMEOUT_MS,
        });

        const explorerUrl = createExplorerTxUrl(true, txHash);

        if (txReceipt.status === 'success') {
          notifySuccess(options.txName, explorerUrl);
        } else {
          notifyError(
            options.txName,
            `${options.txName} reverted. Explorer: ${explorerUrl ?? 'unavailable'}`,
          );
        }

        return txReceipt.status === 'success';
      } catch (possibleError) {
        const error = ensureError(possibleError);
        const normalizedError = isReceiptTimeoutError(error)
          ? new Error(
              `Transaction confirmation timed out after ${Math.round(
                RECEIPT_TIMEOUT_MS / 1000,
              )} seconds`,
            )
          : error;

        notifyError(options.txName, normalizedError);

        return false;
      }
    },
    [
      abi,
      activeChain,
      activeEvmAddress20,
      activeWallet,
      connectorClient,
      createExplorerTxUrl,
      notifyError,
      notifyProcessing,
      notifySuccess,
      switchChain,
    ],
  );

  // Only provide the write function once the connector client is ready,
  // and there is an active EVM account.
  return connectorClient === undefined || activeEvmAddress20 === null
    ? null
    : write;
};

export default useContractWrite;
