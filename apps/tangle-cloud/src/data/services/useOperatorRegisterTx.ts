/**
 * Hook for registering as an operator for blueprints via the Tangle contract.
 */

import { useCallback } from 'react';
import { encodeFunctionData, parseUnits } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import TangleABI from '@tangle-network/tangle-shared-ui/abi/Tangle';
import { getTangleContractAddress } from '@tangle-network/tangle-shared-ui/constants/tangleContracts';
import { useContractWrite } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

export interface OperatorRegisterParams {
  blueprintId: bigint;
  ecdsaPublicKey: `0x${string}`;
  rpcAddress: string;
  registrationInputs?: `0x${string}`;
  amount: string; // Amount in human-readable format
}

export interface OperatorBatchRegisterParams {
  blueprintIds: bigint[];
  ecdsaPublicKey: `0x${string}`;
  rpcAddress: string;
  registrationArgs: (`0x${string}` | undefined)[];
  amounts: string[]; // Amounts in human-readable format
}

/**
 * Hook to register as an operator for a single blueprint.
 */
export const useOperatorRegisterTx = () => {
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const {
    execute: executeWrite,
    status,
    error,
    reset,
    txHash,
  } = useContractWrite();

  const tangleAddress = chainId ? getTangleContractAddress(chainId) : null;

  const execute = useCallback(
    async (params: OperatorRegisterParams) => {
      if (!tangleAddress || !userAddress) {
        return null;
      }

      const amountBigInt = parseUnits(params.amount, TANGLE_TOKEN_DECIMALS);

      // Use the overloaded version with registrationInputs if provided
      const args = params.registrationInputs
        ? [
            params.blueprintId,
            params.ecdsaPublicKey,
            params.rpcAddress,
            params.registrationInputs,
          ]
        : [params.blueprintId, params.ecdsaPublicKey, params.rpcAddress];

      const data = encodeFunctionData({
        abi: TangleABI,
        functionName: 'registerOperator',
        args,
      });

      return executeWrite({
        to: tangleAddress,
        data,
        value: amountBigInt,
      });
    },
    [tangleAddress, userAddress, executeWrite],
  );

  return {
    execute: tangleAddress && userAddress ? execute : null,
    status,
    error,
    reset,
    txHash,
    isReady: tangleAddress !== null && userAddress !== undefined,
  };
};

/**
 * Hook to register as an operator for multiple blueprints.
 * This batches multiple registration calls together.
 */
export const useOperatorBatchRegisterTx = () => {
  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const {
    execute: executeWrite,
    status,
    error,
    reset,
    txHash,
  } = useContractWrite();

  const tangleAddress = chainId ? getTangleContractAddress(chainId) : null;

  const execute = useCallback(
    async (params: OperatorBatchRegisterParams) => {
      if (!tangleAddress || !userAddress) {
        return null;
      }

      const {
        blueprintIds,
        ecdsaPublicKey,
        rpcAddress,
        registrationArgs,
        amounts,
      } = params;

      // Calculate total amount
      let totalAmount = 0n;
      for (const amount of amounts) {
        totalAmount += parseUnits(amount, TANGLE_TOKEN_DECIMALS);
      }

      // For batch registration, we need to encode multiple calls
      // Using the Multicall approach - encode each registration and batch
      const calls: `0x${string}`[] = [];

      for (let i = 0; i < blueprintIds.length; i++) {
        const regArgs = registrationArgs[i];
        const args = regArgs
          ? [blueprintIds[i], ecdsaPublicKey, rpcAddress, regArgs]
          : [blueprintIds[i], ecdsaPublicKey, rpcAddress];

        const callData = encodeFunctionData({
          abi: TangleABI,
          functionName: 'registerOperator',
          args,
        });

        calls.push(callData);
      }

      // If only one blueprint, use single call
      if (calls.length === 1) {
        return executeWrite({
          to: tangleAddress,
          data: calls[0],
          value: totalAmount,
        });
      }

      // For multiple blueprints, use multicall if available
      // Otherwise, we would need to execute them sequentially
      // For now, use aggregate/multicall pattern
      const multicallData = encodeFunctionData({
        abi: TangleABI,
        functionName: 'multicall',
        args: [calls],
      });

      return executeWrite({
        to: tangleAddress,
        data: multicallData,
        value: totalAmount,
      });
    },
    [tangleAddress, userAddress, executeWrite],
  );

  return {
    execute: tangleAddress && userAddress ? execute : null,
    status,
    error,
    reset,
    txHash,
    isReady: tangleAddress !== null && userAddress !== undefined,
  };
};

export default useOperatorRegisterTx;
