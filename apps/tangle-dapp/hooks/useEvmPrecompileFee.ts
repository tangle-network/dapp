'use client';

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { useCallback, useState } from 'react';

import {
  getAbiForPrecompile,
  getAddressOfPrecompile,
  type Precompile,
} from '../constants/evmPrecompiles';
import type { EvmAbiCallData } from './types';
import useEvmAddress from './useEvmAddress';
import useViemPublicClient from './useViemPublicClient';

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

function useEvmPrecompileFeeFetcher<PrecompileT extends Precompile>() {
  const [status, setStatus] = useState<QueryStatus>('idle');
  const [error, setError] = useState<WebbError | null>(null);

  const activeEvmAddress = useEvmAddress();
  const client = useViemPublicClient();

  const fetchEvmPrecompileFees = useCallback(
    async (
      precompile: PrecompileT,
      abiCallData: EvmAbiCallData<PrecompileT>
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
          address: getAddressOfPrecompile(precompile),
          abi: getAbiForPrecompile(precompile),
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
