/**
 * EVM hook for batch registering an operator for multiple blueprints.
 */

import { useCallback, useState } from 'react';
import type { Hash } from 'viem';
import { zeroAddress } from 'viem';
import { useChainId } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '@tangle-network/tangle-shared-ui/abi/tangle';
import useContractWrite, {
  TxStatus,
} from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';

export { TxStatus };

export interface OperatorBatchRegisterParams {
  ecdsaPublicKey: `0x${string}`;
  rpcAddress: string;
  registrations: {
    blueprintId: bigint;
    registrationArgs?: `0x${string}`;
  }[];
}

export interface OperatorBatchRegisterResult {
  successfulBlueprintIds: bigint[];
  failedBlueprintIds: bigint[];
  txHashes: Hash[];
}

export interface UseOperatorBatchRegisterTxOptions {
  onProgress?: (progress: {
    current: number;
    total: number;
    blueprintId: bigint;
  }) => void;
}

export interface OperatorBatchPreRegisterParams {
  blueprintIds: bigint[];
}

export interface OperatorBatchPreRegisterResult {
  successfulBlueprintIds: bigint[];
  failedBlueprintIds: bigint[];
  txHashes: Hash[];
}

/**
 * Hook for batch registering as an operator for multiple blueprints.
 */
export const useOperatorBatchRegisterTx = (
  options?: UseOperatorBatchRegisterTxOptions,
) => {
  const chainId = useChainId();
  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }
  const [status, setStatus] = useState<TxStatus>(TxStatus.NOT_YET_INITIATED);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const registerSingleHook = useContractWrite(
    TANGLE_ABI,
    (params: {
      blueprintId: bigint;
      ecdsaPublicKey: `0x${string}`;
      rpcAddress: string;
      registrationArgs: `0x${string}`;
    }) => {
      if (!contracts || contracts.tangle === zeroAddress) {
        return null;
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'registerOperator' as const,
        args: [
          params.blueprintId,
          params.ecdsaPublicKey,
          params.rpcAddress,
          params.registrationArgs,
        ] as const,
      };
    },
    {
      txName: 'register operator',
      txDetails: (params) =>
        new Map([
          ['Blueprint ID', params.blueprintId.toString()],
          ['RPC Endpoint', params.rpcAddress],
        ]),
      getSuccessMessage: (params) =>
        `Operator registered for blueprint #${params.blueprintId}`,
    },
  );

  const execute = async (
    params: OperatorBatchRegisterParams,
  ): Promise<OperatorBatchRegisterResult | null> => {
    const { registrations, ecdsaPublicKey, rpcAddress } = params;

    if (registrations.length === 0) {
      setStatus(TxStatus.ERROR);
      setError(
        new Error('At least one blueprint is required for registration'),
      );
      return null;
    }
    if (!contracts || contracts.tangle === zeroAddress) {
      setStatus(TxStatus.ERROR);
      setError(new Error('Tangle contract not available on this network'));
      return null;
    }

    setStatus(TxStatus.PROCESSING);
    setError(null);
    setTxHash(null);

    const successfulBlueprintIds: bigint[] = [];
    const failedBlueprintIds: bigint[] = [];
    const txHashes: Hash[] = [];

    for (let index = 0; index < registrations.length; index++) {
      const registration = registrations[index];
      options?.onProgress?.({
        current: index + 1,
        total: registrations.length,
        blueprintId: registration.blueprintId,
      });

      const result = await registerSingleHook.execute?.({
        blueprintId: registration.blueprintId,
        ecdsaPublicKey,
        rpcAddress,
        registrationArgs: registration.registrationArgs ?? '0x',
      });

      if (result?.hash) {
        successfulBlueprintIds.push(registration.blueprintId);
        txHashes.push(result.hash);
        setTxHash(result.hash);
      } else {
        failedBlueprintIds.push(registration.blueprintId);
      }
    }

    if (successfulBlueprintIds.length === 0) {
      const noSuccessError =
        registerSingleHook.error ??
        new Error('Failed to register for all selected blueprints');
      setStatus(TxStatus.ERROR);
      setError(noSuccessError);
      return null;
    }

    setStatus(TxStatus.COMPLETE);
    if (failedBlueprintIds.length > 0) {
      setError(
        new Error(
          `Registered for ${successfulBlueprintIds.length} of ${registrations.length} blueprints`,
        ),
      );
    }

    return {
      successfulBlueprintIds,
      failedBlueprintIds,
      txHashes,
    };
  };

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
    setError(null);
    setTxHash(null);
    registerSingleHook.reset();
  }, [registerSingleHook]);

  return {
    execute,
    status,
    error,
    reset,
    txHash,
    isSuccess: status === TxStatus.COMPLETE,
    isPending: status === TxStatus.PROCESSING,
  };
};

/**
 * Hook for signaling operator intent before full blueprint registration.
 *
 * The protocol emits OperatorPreRegistered for indexers and Blueprint Managers.
 * It does not write endpoint preferences or blueprint-specific registration
 * inputs, so operators can follow up with full registration later.
 */
export const useOperatorBatchPreRegisterTx = (
  options?: UseOperatorBatchRegisterTxOptions,
) => {
  const chainId = useChainId();
  let contracts: ReturnType<typeof getContractsByChainId> | null = null;
  try {
    contracts = getContractsByChainId(chainId);
  } catch {
    contracts = null;
  }
  const [status, setStatus] = useState<TxStatus>(TxStatus.NOT_YET_INITIATED);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const preRegisterSingleHook = useContractWrite(
    TANGLE_ABI,
    (params: { blueprintId: bigint }) => {
      if (!contracts || contracts.tangle === zeroAddress) {
        return null;
      }

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'preRegister' as const,
        args: [params.blueprintId] as const,
      };
    },
    {
      txName: 'pre-register operator',
      txDetails: (params) =>
        new Map([['Blueprint ID', params.blueprintId.toString()]]),
      getSuccessMessage: (params) =>
        `Operator intent signaled for blueprint #${params.blueprintId}`,
    },
  );

  const execute = async (
    params: OperatorBatchPreRegisterParams,
  ): Promise<OperatorBatchPreRegisterResult | null> => {
    const { blueprintIds } = params;

    if (blueprintIds.length === 0) {
      setStatus(TxStatus.ERROR);
      setError(new Error('At least one blueprint is required'));
      return null;
    }
    if (!contracts || contracts.tangle === zeroAddress) {
      setStatus(TxStatus.ERROR);
      setError(new Error('Tangle contract not available on this network'));
      return null;
    }

    setStatus(TxStatus.PROCESSING);
    setError(null);
    setTxHash(null);

    const successfulBlueprintIds: bigint[] = [];
    const failedBlueprintIds: bigint[] = [];
    const txHashes: Hash[] = [];

    for (let index = 0; index < blueprintIds.length; index++) {
      const blueprintId = blueprintIds[index];
      options?.onProgress?.({
        current: index + 1,
        total: blueprintIds.length,
        blueprintId,
      });

      const result = await preRegisterSingleHook.execute?.({ blueprintId });

      if (result?.hash) {
        successfulBlueprintIds.push(blueprintId);
        txHashes.push(result.hash);
        setTxHash(result.hash);
      } else {
        failedBlueprintIds.push(blueprintId);
      }
    }

    if (successfulBlueprintIds.length === 0) {
      const noSuccessError =
        preRegisterSingleHook.error ??
        new Error('Failed to signal intent for all selected blueprints');
      setStatus(TxStatus.ERROR);
      setError(noSuccessError);
      return null;
    }

    setStatus(TxStatus.COMPLETE);
    if (failedBlueprintIds.length > 0) {
      setError(
        new Error(
          `Signaled intent for ${successfulBlueprintIds.length} of ${blueprintIds.length} blueprints`,
        ),
      );
    }

    return {
      successfulBlueprintIds,
      failedBlueprintIds,
      txHashes,
    };
  };

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
    setError(null);
    setTxHash(null);
    preRegisterSingleHook.reset();
  }, [preRegisterSingleHook]);

  return {
    execute,
    status,
    error,
    reset,
    txHash,
    isSuccess: status === TxStatus.COMPLETE,
    isPending: status === TxStatus.PROCESSING,
  };
};
