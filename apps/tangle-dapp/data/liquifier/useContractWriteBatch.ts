import { useWebContext } from '@webb-tools/api-provider-environment';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import {
  calculateTypedChainId,
  ChainType,
} from '@webb-tools/sdk-core/typed-chain-id';
import assert from 'assert';
import { useCallback } from 'react';
import { Abi as ViemAbi, ContractFunctionName } from 'viem';
import { sepolia } from 'viem/chains';
import { useConnectorClient } from 'wagmi';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import { MULTICALL3_CONTRACT_ADDRESS } from '../../constants/liquidStaking/constants';
import MULTICALL3_ABI from '../../constants/liquidStaking/multicall3Abi';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContractWrite, { ContractWriteOptions } from './useContractWrite';

export type ContractBatchWriteOptions<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'nonpayable'>,
> = Omit<ContractWriteOptions<Abi, FunctionName>, 'args'> & {
  args: ContractWriteOptions<Abi, FunctionName>[];
};

const useContractWriteBatch = <Abi extends ViemAbi>() => {
  const { data: connectorClient } = useConnectorClient();
  const activeEvmAddress20 = useEvmAddress20();
  const { activeChain, activeWallet, switchChain } = useWebContext();
  const writeMulticall3 = useContractWrite(MULTICALL3_ABI);

  const write = useCallback(
    async <
      FunctionName extends ContractFunctionName<Abi, 'nonpayable' | 'payable'>,
    >(
      options: ContractBatchWriteOptions<Abi, FunctionName>,
    ) => {
      assert(
        writeMulticall3 !== null,
        'Should not be able to call this function if the multicall3 write function is not ready yet',
      );

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

      const calls = options.args.map((arg) => ({
        target: arg.address,
        allowFailure: true,
        // TODO: Convert the args to callData.
        callData: [] as any,
      }));

      return writeMulticall3({
        address: MULTICALL3_CONTRACT_ADDRESS,
        functionName: 'aggregate3',
        args: [calls],
        txName: options.txName,
      });
    },
    [
      activeChain,
      activeEvmAddress20,
      activeWallet,
      connectorClient,
      switchChain,
      writeMulticall3,
    ],
  );

  // Only provide the write function once the connector client is ready,
  // and there is an active EVM account.
  return connectorClient === undefined || activeEvmAddress20 === null
    ? null
    : write;
};

export default useContractWriteBatch;
