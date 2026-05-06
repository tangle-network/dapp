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

interface DepositResult {
  amount: bigint;
  delegatedAmount: bigint;
}

export interface UseOnChainDelegatorOptions {
  tokenAddresses: Address[];
  enabled?: boolean;
}

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
      'stakingOnChainDelegator',
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
            lockedAmount: BigInt(0),
            lastUpdatedAt: BigInt(Date.now()),
          });

          totalDeposited += deposit.amount;
          totalDelegated += deposit.delegatedAmount;
        }
      }

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
        delegations: [],
        withdrawRequests: [],
        unstakeRequests: [],
      };

      return delegator;
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      !!address &&
      tokenAddresses.length > 0,
    staleTime: 15_000,
    refetchInterval: 15_000,
    retry: 2,
  });
};

export default useOnChainDelegator;
