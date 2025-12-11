/**
 * Hook to fetch protocol configuration from the MultiAssetDelegation contract.
 * Replaces the Substrate-based useRestakeConsts hook.
 */

import { useQuery } from '@tanstack/react-query';
import { usePublicClient, useChainId } from 'wagmi';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

// Protocol configuration
export interface ProtocolConfig {
  // Current round number
  currentRound: bigint;
  // Round duration in seconds
  roundDuration: bigint;
  // Delay in rounds before delegator unstake is ready
  delegationBondLessDelay: bigint;
  // Delay in rounds before delegator withdrawal is ready
  leaveDelegatorsDelay: bigint;
  // Delay in rounds before operator can leave
  leaveOperatorsDelay: bigint;
}

/**
 * Hook to fetch protocol configuration from the contract.
 *
 * @example
 * ```tsx
 * const { data: config, isLoading } = useProtocolConfig();
 *
 * console.log(config?.currentRound); // Current round number
 * console.log(config?.leaveDelegatorsDelay); // Rounds until withdrawal is ready
 * ```
 */
export const useProtocolConfig = (options?: { enabled?: boolean }) => {
  const { enabled = true } = options ?? {};
  const publicClient = usePublicClient();
  const chainId = useChainId();

  return useQuery({
    queryKey: ['protocolConfig', chainId, publicClient?.chain?.id],
    queryFn: async () => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const contracts = getContractsByChainId(chainId);

      // Multicall to fetch all config values at once
      const results = await publicClient.multicall({
        contracts: [
          {
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'currentRound',
          },
          {
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'roundDuration',
          },
          {
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'delegationBondLessDelay',
          },
          {
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'leaveDelegatorsDelay',
          },
          {
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'leaveOperatorsDelay',
          },
        ],
      });

      // Check for errors
      const errors = results.filter((r) => r.status === 'failure');
      if (errors.length > 0) {
        console.error('Failed to fetch some protocol config values:', errors);
      }

      return {
        currentRound:
          results[0].status === 'success'
            ? (results[0].result as bigint)
            : BigInt(0),
        roundDuration:
          results[1].status === 'success'
            ? (results[1].result as bigint)
            : BigInt(0),
        delegationBondLessDelay:
          results[2].status === 'success'
            ? (results[2].result as bigint)
            : BigInt(0),
        leaveDelegatorsDelay:
          results[3].status === 'success'
            ? (results[3].result as bigint)
            : BigInt(0),
        leaveOperatorsDelay:
          results[4].status === 'success'
            ? (results[4].result as bigint)
            : BigInt(0),
      } satisfies ProtocolConfig;
    },
    enabled: enabled && !!publicClient,
    staleTime: 60_000, // 1 minute - config values rarely change
    refetchInterval: 60_000, // Refresh every minute
  });
};

/**
 * Hook to get withdrawal delay in human-readable format.
 */
export const useWithdrawalDelay = () => {
  const { data: config, isLoading } = useProtocolConfig();

  if (isLoading || !config) {
    return { delay: null, isLoading };
  }

  // Calculate delay in seconds
  const delaySeconds = config.leaveDelegatorsDelay * config.roundDuration;

  return {
    delay: delaySeconds,
    delayRounds: config.leaveDelegatorsDelay,
    roundDuration: config.roundDuration,
    isLoading: false,
  };
};

/**
 * Hook to get unstake delay in human-readable format.
 */
export const useUnstakeDelay = () => {
  const { data: config, isLoading } = useProtocolConfig();

  if (isLoading || !config) {
    return { delay: null, isLoading };
  }

  // Calculate delay in seconds
  const delaySeconds = config.delegationBondLessDelay * config.roundDuration;

  return {
    delay: delaySeconds,
    delayRounds: config.delegationBondLessDelay,
    roundDuration: config.roundDuration,
    isLoading: false,
  };
};

export default useProtocolConfig;
