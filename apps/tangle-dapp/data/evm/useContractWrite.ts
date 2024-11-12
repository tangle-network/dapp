import { HexString } from '@polkadot/util/types';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import ensureError from '@webb-tools/tangle-shared-ui/utils/ensureError';
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
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useTxNotification, {
  NotificationSteps,
} from '../../hooks/useTxNotification';

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
          // TODO: Getting the type of `args` and `abi` right has proven quite difficult.
          abi: abi as ViemAbi,
          args: options.args as unknown[],
        });

        const txHash = await writeContract(connectorClient, request);

        const txReceipt = await waitForTransactionReceipt(connectorClient, {
          hash: txHash,
          // TODO: Make use of the `timeout` parameter, and error handle if it fails due to timeout.
        });

        if (txReceipt.status === 'success') {
          let explorerUrl: string | undefined = undefined;

          if (activeChain?.blockExplorers?.default !== undefined) {
            explorerUrl = makeExplorerUrl(
              activeChain.blockExplorers.default.url,
              txHash,
              'tx',
              'web3',
            );
          }

          notifySuccess(options.txName, explorerUrl);
        } else {
          // TODO: Improve UX by at least providing a link to the transaction hash. The idea is that if there was an error, it would have been caught by the try-catch, so this part here is sort of an 'unreachable' section.
          notifyError(
            options.txName,
            `${options.txName} reverted, but no information about the error is known`,
          );
        }

        return txReceipt.status === 'success';
      } catch (possibleError) {
        const error = ensureError(possibleError);

        notifyError(options.txName, error);

        return false;
      }
    },
    [
      abi,
      activeChain,
      activeEvmAddress20,
      activeWallet,
      connectorClient,
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
