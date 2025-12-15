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
  decodeAbiParameters,
  decodeErrorResult,
  type Hex,
} from 'viem';
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
} from 'viem/actions';
import { useConnectorClient, usePublicClient } from 'wagmi';
import ensureError from '../utils/ensureError';
import useEvmAddress from './useEvmAddress';
import useNetworkStore from '../context/useNetworkStore';
import useTxHistoryStore from '../context/useTxHistoryStore';
import type { HexString } from '@polkadot/util/types';
import type { HistoryTxDetail } from '../context/useTxHistoryStore';

// Transaction status enum
export enum TxStatus {
  NOT_YET_INITIATED = 'NOT_YET_INITIATED',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

const tryDecodeViemCustomError = (
  abi: Abi,
  possibleError: unknown,
): string | null => {
  const visited = new Set<unknown>();
  const findRevertData = (value: unknown, depth: number): string | null => {
    if (depth <= 0) return null;
    if (typeof value === 'string') {
      if (value.startsWith('0x') && value.length >= 10) return value;
      return null;
    }
    if (value === null || typeof value !== 'object') return null;
    if (visited.has(value)) return null;
    visited.add(value);

    const obj = value as Record<string, unknown>;
    for (const key of ['data', 'error', 'cause', 'details']) {
      if (key in obj) {
        const found = findRevertData(obj[key], depth - 1);
        if (found) return found;
      }
    }

    for (const v of Object.values(obj)) {
      const found = findRevertData(v, depth - 1);
      if (found) return found;
    }

    return null;
  };

  const data = findRevertData(possibleError, 6);
  if (data === null) return null;

  try {
    const decoded = decodeErrorResult({ abi, data: data as Hex });
    return decoded.errorName;
  } catch {
    // Standard revert reason: Error(string)
    if (data.startsWith('0x08c379a0')) {
      try {
        const [reason] = decodeAbiParameters(
          [{ type: 'string' }],
          `0x${data.slice(10)}` as Hex,
        );
        if (typeof reason === 'string' && reason.length > 0) return reason;
      } catch {
        // ignore
      }
    }

    return null;
  }
};

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
  /**
   * Optional transaction name for the tx history store / UI (e.g. "restake deposit").
   * If omitted, falls back to the contract function name.
   */
  txName?: string;
  /**
   * Optional details shown in transaction history UI.
   * Returned values should be display-ready (e.g. strings), since the UI may not
   * know token decimals or other context to format raw values.
   */
  txDetails?: (context: TContext) => Map<string, HistoryTxDetail> | undefined;
  /**
   * Enable writing tx lifecycle events into `useTxHistoryStore`.
   * Defaults to true.
   */
  enableTxHistory?: boolean;
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
  const publicClient = usePublicClient();
  const networkId = useNetworkStore((store) => store.network2?.id);
  const pushTx = useTxHistoryStore((store) => store.pushTx);
  const patchTx = useTxHistoryStore((store) => store.patchTx);

  const toTxDetails = useCallback(
    (callConfig: ContractCallConfig<TAbi, TFunctionName>) => {
      const details = new Map<string, HistoryTxDetail>();

      details.set('Contract', String(callConfig.address));
      details.set('Function', String(callConfig.functionName));

      if (callConfig.value !== undefined && callConfig.value !== BigInt(0)) {
        details.set('Value', callConfig.value.toString());
      }

      return details;
    },
    [],
  );

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

      if (publicClient === undefined) {
        console.warn(
          'Cannot execute contract write: Public client not ready (check RPC config)',
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

      const enableTxHistory = options?.enableTxHistory !== false;
      const txName = options?.txName ?? String(callConfig.functionName);

      let submittedHash: Hash | null = null;
      try {
        // Simulate the transaction first (via public RPC, not the wallet provider).
        // This avoids wallet/provider-specific issues that can prevent the signing prompt.
        type WriteRequest = Parameters<typeof writeContract>[1];
        let request: WriteRequest | null = null;

        try {
          const simulated = await simulateContract(publicClient, {
            address: callConfig.address,
            abi: abi as Abi,
            functionName: callConfig.functionName as string,
            args: callConfig.args as readonly unknown[],
            value: callConfig.value,
            account: activeAddress,
          });
          request = simulated.request as WriteRequest;
        } catch (simulateError) {
          // If simulation fails due to an RPC transport issue, fall back to sending directly.
          // This preserves the normal "wallet pops up" UX in local/dev environments.
          const message =
            (simulateError as any)?.message ??
            (simulateError as any)?.shortMessage ??
            String(simulateError ?? '');
          const looksLikeRpcFailure =
            typeof message === 'string' &&
            /rpc request failed|failed to fetch|networkerror|load failed/i.test(
              message,
            );

          if (!looksLikeRpcFailure) {
            throw simulateError;
          }

          request = null;
        }

        // Execute the transaction
        const hash =
          request !== null
            ? await writeContract(connectorClient, request)
            : await writeContract(connectorClient, {
                address: callConfig.address,
                abi: abi as Abi,
                functionName: callConfig.functionName as string,
                args: callConfig.args as readonly unknown[],
                value: callConfig.value,
                account: activeAddress,
              });
        submittedHash = hash;
        setTxHash(hash);

        if (enableTxHistory && networkId !== undefined) {
          const details = toTxDetails(callConfig);
          const extraDetails = options?.txDetails?.(context);
          if (extraDetails) {
            for (const [key, value] of extraDetails.entries()) {
              details.set(key, value);
            }
          }

          pushTx({
            name: txName,
            hash: hash as unknown as HexString,
            origin: activeAddress,
            network: networkId,
            timestamp: Date.now(),
            status: 'pending',
            details,
          });
        }

        // Ensure the pending state can render at least once before we patch to finalized/failed.
        await new Promise((resolve) => setTimeout(resolve, 0));

        // Wait for confirmation
        const receipt = await waitForTransactionReceipt(publicClient, {
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

          if (enableTxHistory && networkId !== undefined) {
            patchTx(hash as unknown as HexString, { status: 'finalized' });
          }
        } else {
          const revertError = new Error('Transaction reverted');
          setStatus(TxStatus.ERROR);
          setError(revertError);
          options?.onError?.(revertError, context);

          if (enableTxHistory && networkId !== undefined) {
            patchTx(hash as unknown as HexString, {
              status: 'failed',
              errorMessage: revertError.message,
            });
          }
        }

        return txResult;
      } catch (possibleError) {
        console.error('Contract write error:', possibleError);

        const decodedCustomError = tryDecodeViemCustomError(
          abi as Abi,
          possibleError,
        );
        const error = decodedCustomError
          ? new Error(`Execution reverted: ${decodedCustomError}`)
          : ensureError(possibleError);
        setStatus(TxStatus.ERROR);
        setError(error);
        options?.onError?.(error, context as TContext);

        if (
          enableTxHistory &&
          submittedHash !== null &&
          networkId !== undefined
        ) {
          patchTx(submittedHash as unknown as HexString, {
            status: 'failed',
            errorMessage: error.message,
          });
        }

        return null;
      }
    },
    [
      activeAddress,
      status,
      connectorClient,
      publicClient,
      factory,
      abi,
      options,
      networkId,
      pushTx,
      patchTx,
      toTxDetails,
    ],
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
