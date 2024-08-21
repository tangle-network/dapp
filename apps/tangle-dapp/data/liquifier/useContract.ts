import { HexString } from '@polkadot/util/types';
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
import { ReadContractReturnType } from 'wagmi/actions';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useViemPublicClientWithChain from './useViemPublicClientWithChain';

export type ContractReadOptions<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>,
> = {
  address: HexString;
  functionName: FunctionName;
  args: ContractFunctionArgs<Abi, 'pure' | 'view', FunctionName>;
};

export type ContractWriteOptions<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'nonpayable'>,
> = {
  address: HexString;
  functionName: FunctionName;
  args: ContractFunctionArgs<Abi, 'payable' | 'nonpayable', FunctionName>;
};

const useContract = <Abi extends ViemAbi>(abi: Abi) => {
  // Use Sepolia testnet for development, and mainnet for production.
  // Some dummy contracts were deployed on Sepolia for testing purposes.
  const chain = IS_PRODUCTION_ENV ? mainnet : sepolia;

  const publicClient = useViemPublicClientWithChain(chain);
  const { data: connectorClient } = useConnectorClient();
  const activeEvmAddress20 = useEvmAddress20();

  const read = useCallback(
    <FunctionName extends ContractFunctionName<Abi, 'pure' | 'view'>>(
      options: ContractReadOptions<Abi, FunctionName>,
    ): Promise<
      ReadContractReturnType<Abi, FunctionName, typeof options.args>
    > => {
      assert(
        publicClient !== null,
        "Should not be able to call this function if the client isn't ready yet",
      );

      return publicClient.readContract({
        address: options.address,
        abi,
        functionName: options.functionName,
        args: options.args,
      });
    },
    [abi, publicClient],
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

      // TODO: Handle possible errors thrown by `simulateContract`.
      const { request } = await simulateContract(connectorClient, {
        chain: mainnet,
        address: options.address,
        functionName: options.functionName,
        account: activeEvmAddress20,
        // TODO: Getting the type of `args` and `abi` right has proven quite difficult.
        abi: abi as any,
        args: options.args as any,
      });

      const txHash = await writeContract(connectorClient, request);

      // Return the transaction receipt, which contains the transaction status.
      return waitForTransactionReceipt(connectorClient, {
        hash: txHash,
        // TODO: Make use of the `timeout` parameter, and error handle if it fails due to timeout.
      });
    },
    [abi, activeEvmAddress20, connectorClient],
  );

  // TODO: This only loads the balance once. Make it so it updates every few seconds that way the it responds to any balance changes that may occur, not just when loading the site initially. Like a subscription. So, add an extra function like `readStream` or `subscribe` that will allow the user to subscribe to the contract and get updates whenever the contract changes.

  return {
    // Only provide the read functions once the public client is ready.
    read: publicClient === null ? null : read,
    // Only provide the write function once the connector client is ready,
    // and there is an active EVM account.
    write:
      connectorClient === undefined || activeEvmAddress20 === null
        ? null
        : write,
  };
};

export default useContract;
