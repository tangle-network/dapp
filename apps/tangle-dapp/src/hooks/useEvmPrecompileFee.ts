import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useCallback, useState } from 'react';

import { PrecompileAddress } from '../constants/evmPrecompiles';
import useEvmAddress20 from './useEvmAddress';
import { AbiCall } from './useEvmPrecompileAbiCall';
import useViemPublicClient from './useViemPublicClient';
import { AbiFunction } from 'viem';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

function useEvmPrecompileFeeFetcher() {
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<WebbError | null>(null);

  const activeEvmAddress = useEvmAddress20();
  const client = useViemPublicClient();

  const fetchEvmPrecompileFees = useCallback(
    async <T extends AbiFunction[]>(
      abi: T,
      precompileAddress: PrecompileAddress,
      abiCallData: AbiCall<T>,
    ) => {
      setStatus('loading');
      setError(null);

      if (client === null) {
        setStatus('error');
        setError(WebbError.from(WebbErrorCodes.ApiNotReady));

        return null;
      }

      const [gas, fees] = await Promise.all([
        client.estimateContractGas({
          address: precompileAddress,
          // TODO: Find a way to avoid casting.
          abi: abi satisfies AbiFunction[] as AbiFunction[],
          functionName: abiCallData.functionName,
          args: abiCallData.arguments,
          account: activeEvmAddress !== null ? activeEvmAddress : undefined,
        }),

        client.estimateFeesPerGas({
          chain: client.chain,
        }),
      ] as const);

      setStatus('success');

      return {
        gas,
        ...fees,
      };
    },
    [activeEvmAddress, client],
  );

  const resetStates = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, [setStatus, setError]);

  return {
    status,
    error,
    fetchEvmPrecompileFees,
    resetStates,
  };
}

export default useEvmPrecompileFeeFetcher;
