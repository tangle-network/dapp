import assert from 'assert';
import { useCallback } from 'react';
import { Abi as ViemAbi, ContractFunctionName, encodeFunctionData } from 'viem';
import { useConnectorClient } from 'wagmi';

import { MULTICALL3_CONTRACT_ADDRESS } from '../../constants/liquidStaking/constants';
import MULTICALL3_ABI from '../../constants/liquidStaking/multicall3Abi';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContractWrite, { ContractWriteOptions } from './useContractWrite';

export type ContractBatchWriteOptions<
  Abi extends ViemAbi,
  FunctionName extends ContractFunctionName<Abi, 'nonpayable'>,
> = Omit<ContractWriteOptions<Abi, FunctionName>, 'args'> & {
  args: ContractWriteOptions<Abi, FunctionName>['args'][];
};

const useContractWriteBatch = <Abi extends ViemAbi>(abi: ViemAbi) => {
  const { data: connectorClient } = useConnectorClient();
  const activeEvmAddress20 = useEvmAddress20();
  const writeMulticall3 = useContractWrite(MULTICALL3_ABI);

  const write = useCallback(
    async <FunctionName extends ContractFunctionName<Abi, 'nonpayable'>>(
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

      const calls = options.args.map((arg) => {
        const callData = encodeFunctionData<typeof abi>({
          abi,
          functionName: options.functionName,
          // TODO: Getting the type of `args` right has proven quite difficult.
          args: arg as unknown[],
        });

        return {
          target: options.address,
          allowFailure: true,
          callData,
        } as const;
      });

      return writeMulticall3({
        address: MULTICALL3_CONTRACT_ADDRESS,
        functionName: 'aggregate3',
        args: [calls],
        txName: options.txName,
      });
    },
    [abi, activeEvmAddress20, connectorClient, writeMulticall3],
  );

  // Only provide the write function once the connector client is ready,
  // and there is an active EVM account.
  return connectorClient === undefined || activeEvmAddress20 === null
    ? null
    : write;
};

export default useContractWriteBatch;
