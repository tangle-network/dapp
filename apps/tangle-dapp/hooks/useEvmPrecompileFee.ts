'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useCallback, useState } from 'react';

import {
  getPrecompileAbi,
  getPrecompileAddress,
  type Precompile,
} from '../constants/evmPrecompiles';
import useEvmAddress from './useEvmAddress';
import { AbiCall } from './useEvmPrecompileAbiCall';
import useViemPublicClient from './useViemPublicClient';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

function useEvmPrecompileFeeFetcher<PrecompileT extends Precompile>() {
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<WebbError | null>(null);

  const activeEvmAddress = useEvmAddress();
  const client = useViemPublicClient();

  const fetchEvmPrecompileFees = useCallback(
    async (precompile: PrecompileT, abiCallData: AbiCall<PrecompileT>) => {
      setStatus('loading');
      setError(null);

      if (client === null) {
        setStatus('error');
        setError(WebbError.from(WebbErrorCodes.ApiNotReady));
        return null;
      }

      const [gas, fees] = await Promise.all([
        client.estimateContractGas({
          address: getPrecompileAddress(precompile),
          abi: getPrecompileAbi(precompile),
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
    [activeEvmAddress, client]
  );

  const resetStates = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return {
    status,
    error,
    fetchEvmPrecompileFees,
    resetStates,
  };
}

export default useEvmPrecompileFeeFetcher;
