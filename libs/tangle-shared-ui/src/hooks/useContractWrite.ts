/**
 * Pure EVM contract write hook for v2 EVM-only architecture.
 * Replaces useEvmPrecompileCall and useSubstrateTx for all transactions.
 *
 * Uses WAGMI/Viem for contract interactions with:
 * - Simulation before execution
 * - Transaction receipt waiting
 * - Error handling
 * - Toast notifications (optional)
 */

import { useCallback, useState } from 'react';
import {
  Address,
  Hash,
  Abi,
  ContractFunctionName,
  ContractFunctionArgs,
} from 'viem';
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from 'viem/actions';
import { useConnectorClient } from 'wagmi';
import ensureError from '../utils/ensureError';
import useEvmAddress from './useEvmAddress';

// Transaction status enum
export enum TxStatus {
  NOT_YET_INITIATED = 'NOT_YET_INITIATED',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

// Transaction result
export interface TxResult {
  hash: Hash;
  status: 'success' | 'reverted';
  blockNumber: bigint;
}

// Contract call configuration
export interface ContractCallConfig<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
> {
  address: Address;
  abi: TAbi;
  functionName: TFunctionName;
  args: ContractFunctionArgs<TAbi, 'nonpayable' | 'payable', TFunctionName>;
  value?: bigint;
}

// Factory function type for creating contract calls
export type ContractCallFactory<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  TContext = void,
> = (
  context: TContext,
  activeAddress: Address,
) =>
  | ContractCallConfig<TAbi, TFunctionName>
  | null
  | Promise<ContractCallConfig<TAbi, TFunctionName> | null>;

// Hook options
export interface UseContractWriteOptions<TContext = void> {
  onSuccess?: (result: TxResult, context: TContext) => void;
  onError?: (error: Error, context: TContext) => void;
  getSuccessMessage?: (context: TContext) => string;
}

/**
 * Hook for executing pure EVM contract writes.
 *
 * @example
 * ```tsx
 * const { execute, status, error, txHash } = useContractWrite(
 *   MULTI_ASSET_DELEGATION_ABI,
 *   (amount, address) => ({
 *     address: CONTRACTS.multiAssetDelegation,
 *     functionName: 'deposit',
 *     args: [tokenAddress, amount, 0], // token, amount, lock duration
 *   }),
 *   { getSuccessMessage: (amount) => `Deposited ${amount}` }
 * );
 *
 * // Later:
 * await execute(depositAmount);
 * ```
 */
const useContractWrite = <
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'nonpayable' | 'payable'>,
  TContext = void,
>(
  abi: TAbi,
  factory:
    | ContractCallFactory<TAbi, TFunctionName, TContext>
    | ContractCallConfig<TAbi, TFunctionName>,
  options?: UseContractWriteOptions<TContext>,
) => {
  const [status, setStatus] = useState<TxStatus>(TxStatus.NOT_YET_INITIATED);
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [result, setResult] = useState<TxResult | null>(null);

  const activeAddress = useEvmAddress();
  const { data: connectorClient } = useConnectorClient();

  const execute = useCallback(
    async (context: TContext): Promise<TxResult | null> => {
      // Validation
      if (activeAddress === null) {
        console.warn('Cannot execute contract write: No active EVM address');
        return null;
      }

      if (status === TxStatus.PROCESSING) {
        console.warn(
          'Cannot execute contract write: Transaction already in progress',
        );
        return null;
      }

      if (connectorClient === undefined) {
        console.warn(
          'Cannot execute contract write: Connector client not ready',
        );
        return null;
      }

      // Build the call config
      const callConfig =
        typeof factory === 'function'
          ? await factory(context, activeAddress)
          : factory;

      if (callConfig === null) {
        console.debug(
          'Contract write factory returned null - dependencies not ready',
        );
        return null;
      }

      // Reset state
      setError(null);
      setTxHash(null);
      setResult(null);
      setSuccessMessage(null);
      setStatus(TxStatus.PROCESSING);

      try {
        // Simulate the transaction first
        const { request } = await simulateContract(connectorClient, {
          address: callConfig.address,
          abi: abi as Abi,
          functionName: callConfig.functionName as string,
          args: callConfig.args as readonly unknown[],
          value: callConfig.value,
          account: activeAddress,
        });

        // Execute the transaction
        const hash = await writeContract(connectorClient, request);
        setTxHash(hash);

        // Wait for confirmation
        const receipt = await waitForTransactionReceipt(connectorClient, {
          hash,
          // TODO: Add configurable timeout
        });

        const txResult: TxResult = {
          hash,
          status: receipt.status,
          blockNumber: receipt.blockNumber,
        };

        setResult(txResult);

        if (receipt.status === 'success') {
          setStatus(TxStatus.COMPLETE);
          setSuccessMessage(options?.getSuccessMessage?.(context) ?? null);
          options?.onSuccess?.(txResult, context);
        } else {
          const revertError = new Error('Transaction reverted');
          setStatus(TxStatus.ERROR);
          setError(revertError);
          options?.onError?.(revertError, context);
        }

        return txResult;
      } catch (possibleError) {
        console.error('Contract write error:', possibleError);

        const error = ensureError(possibleError);
        setStatus(TxStatus.ERROR);
        setError(error);
        options?.onError?.(error, context as TContext);

        return null;
      }
    },
    [activeAddress, status, connectorClient, factory, abi, options],
  );

  const reset = useCallback(() => {
    setStatus(TxStatus.NOT_YET_INITIATED);
    setError(null);
    setTxHash(null);
    setResult(null);
    setSuccessMessage(null);
  }, []);

  return {
    execute: activeAddress !== null ? execute : null,
    reset,
    status,
    error,
    txHash,
    result,
    successMessage,
    isLoading: status === TxStatus.PROCESSING,
    isSuccess: status === TxStatus.COMPLETE,
    isError: status === TxStatus.ERROR,
  };
};

export default useContractWrite;
