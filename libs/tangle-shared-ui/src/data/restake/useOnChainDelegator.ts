/**
 * On-chain fallback for fetching delegator data when the GraphQL indexer is unavailable.
 * Reads deposit info directly from the MultiAssetDelegation contract.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';
import type {
  Delegator,
  DelegatorAssetPosition,
} from '../graphql/useDelegator';

// Deposit result from getDeposit contract call
interface DepositResult {
  amount: bigint;
  delegatedAmount: bigint;
}

export interface UseOnChainDelegatorOptions {
  /** Token addresses to query deposits for */
  tokenAddresses: Address[];
  /** Whether to enable the hook */
  enabled?: boolean;
}

/**
 * Hook to fetch delegator deposit data directly from the contract.
 * Used as a fallback when the GraphQL indexer is unavailable.
 *
 * @param address - The delegator's address
 * @param options - Configuration options including token addresses to query
 */
export const useOnChainDelegator = (
  address: Address | undefined,
  options: UseOnChainDelegatorOptions,
) => {
  const { tokenAddresses, enabled = true } = options;
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const contracts = chainId ? getContractsByChainId(chainId) : null;

  return useQuery({
    queryKey: [
      'onChainDelegator',
      chainId,
      address,
      tokenAddresses.map((t) => t.toLowerCase()).sort(),
    ],
    queryFn: async (): Promise<Delegator | null> => {
      if (!publicClient || !contracts || !address) {
        return null;
      }

      const readDeposit = async (token: Address): Promise<DepositResult> => {
        return (await publicClient.readContract({
          address: contracts.multiAssetDelegation,
          abi: MULTI_ASSET_DELEGATION_ABI,
          functionName: 'getDeposit',
          args: [address, token],
        })) as DepositResult;
      };

      const resolveDeposits = async () => {
        if (
          publicClient.chain?.contracts?.multicall3?.address !== undefined &&
          tokenAddresses.length > 0
        ) {
          try {
            const results = await publicClient.multicall({
              contracts: tokenAddresses.map((token) => ({
                address: contracts.multiAssetDelegation,
                abi: MULTI_ASSET_DELEGATION_ABI,
                functionName: 'getDeposit' as const,
                args: [address, token] as const,
              })),
              allowFailure: true,
            });

            const deposits = results.flatMap((result, index) => {
              if (result.status !== 'success') {
                return [];
              }

              return [
                {
                  token: tokenAddresses[index],
                  deposit: result.result as DepositResult,
                },
              ];
            });

            if (deposits.length > 0) {
              return deposits;
            }
          } catch {
            // Fall back to individual calls below.
          }
        }

        const settled = await Promise.allSettled(
          tokenAddresses.map(async (token) => ({
            token,
            deposit: await readDeposit(token),
          })),
        );

        return settled.flatMap((result) =>
          result.status === 'fulfilled' ? [result.value] : [],
        );
      };

      // Read deposit info for each token
      const assetPositions: DelegatorAssetPosition[] = [];
      let totalDeposited = BigInt(0);
      let totalDelegated = BigInt(0);

      const results = await resolveDeposits();

      for (const { token, deposit } of results) {
        if (deposit.amount > BigInt(0)) {
          assetPositions.push({
            id: `${address.toLowerCase()}-${token.toLowerCase()}`,
            token,
            totalDeposited: deposit.amount,
            delegatedAmount: deposit.delegatedAmount,
            lockedAmount: BigInt(0), // Not available from getDeposit
            lastUpdatedAt: BigInt(Date.now()),
          });

          totalDeposited += deposit.amount;
          totalDelegated += deposit.delegatedAmount;
        }
      }

      // Build minimal delegator object
      const delegator: Delegator = {
        id: address.toLowerCase(),
        address,
        totalDeposited,
        totalDelegated,
        createdAt: BigInt(0),
        updatedAt: BigInt(Date.now()),
        withdrawNonce: BigInt(0),
        unstakeNonce: BigInt(0),
        assetPositions,
        delegations: [], // Not available from on-chain in simple form
        withdrawRequests: [], // Would need separate query
        unstakeRequests: [], // Would need separate query
      };

      return delegator;
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      !!address &&
      tokenAddresses.length > 0,
    staleTime: 15_000, // 15 seconds - user positions change frequently
    refetchInterval: 15_000,
    retry: 2,
  });
};

export default useOnChainDelegator;
