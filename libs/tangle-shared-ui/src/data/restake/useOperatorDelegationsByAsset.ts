/**
 * Hook to fetch an operator's stake per asset from the MultiAssetDelegation contract.
 * Used to display tokens at risk in the service approval flow.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';

// Asset kind constants
const ASSET_KIND_NATIVE = 0;

// Asset type matching contract struct
interface Asset {
  kind: number; // 0 = Native, 1 = ERC20
  token: Address;
}

// Operator stake info per asset
export interface OperatorStakeByAsset {
  /** Token address */
  token: Address;
  /** Asset kind (0 = Native, 1 = ERC20) */
  kind: number;
  /** Total stake for this asset (self-stake + delegated) */
  totalStake: bigint;
}

/**
 * Hook to fetch an operator's stake for specific assets from the contract.
 *
 * @param operatorAddress - The operator's EVM address
 * @param assets - Array of assets to query stake for
 * @param options - Query options
 * @returns Map of token address (lowercase) to stake info
 *
 * @example
 * ```tsx
 * const { data: stakeByAsset, isLoading } = useOperatorStakeByAsset(
 *   operatorAddress,
 *   [{ kind: 1, token: '0x...' }],
 * );
 *
 * // Get stake for a specific asset
 * const tntStake = stakeByAsset?.get(tntTokenAddress.toLowerCase());
 * console.log(tntStake?.totalStake); // 1000000000000000000n (1 TNT)
 * ```
 */
export const useOperatorStakeByAsset = (
  operatorAddress: Address | null | undefined,
  assets: Asset[] | undefined,
  options?: {
    enabled?: boolean;
  },
) => {
  const { enabled = true } = options ?? {};
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const contracts = chainId ? getContractsByChainId(chainId) : null;

  return useQuery({
    queryKey: [
      'operatorStakeByAsset',
      chainId,
      operatorAddress?.toLowerCase(),
      assets?.map((a) => `${a.kind}:${a.token.toLowerCase()}`).sort(),
    ],
    queryFn: async (): Promise<Map<Address, OperatorStakeByAsset>> => {
      if (
        !publicClient ||
        !contracts ||
        !operatorAddress ||
        !assets ||
        assets.length === 0
      ) {
        return new Map();
      }

      const stakeMap = new Map<Address, OperatorStakeByAsset>();

      // Normalize assets for contract calls:
      // - Native assets (kind=0): use (kind=0, zeroAddress)
      // - ERC20 (kind=1) with zero address: treat as native (edge case/fallback)
      // - ERC20 (kind=1) with real address: use as-is
      const normalizedAssets = assets.map((asset) => {
        const isNativeAsset =
          asset.kind === ASSET_KIND_NATIVE || asset.token === zeroAddress;

        return {
          kind: isNativeAsset ? ASSET_KIND_NATIVE : asset.kind,
          token: isNativeAsset ? zeroAddress : asset.token,
          originalToken: asset.token, // Keep original for mapping back
        };
      });

      // Try multicall first for efficiency
      if (publicClient.chain?.contracts?.multicall3?.address !== undefined) {
        try {
          const results = await publicClient.multicall({
            contracts: normalizedAssets.map((asset) => ({
              address: contracts.multiAssetDelegation,
              abi: MULTI_ASSET_DELEGATION_ABI,
              functionName: 'getOperatorStakeForAsset' as const,
              args: [
                operatorAddress,
                { kind: asset.kind, token: asset.token },
              ] as const,
            })),
            allowFailure: true,
          });

          for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const asset = normalizedAssets[i];

            if (result.status === 'success') {
              const stake = result.result as bigint;
              // Use original token address as the key for mapping back
              stakeMap.set(asset.originalToken.toLowerCase() as Address, {
                token: asset.originalToken,
                kind: asset.kind,
                totalStake: stake,
              });
            }
          }

          return stakeMap;
        } catch {
          // Multicall failed, fall through to individual calls
        }
      }

      // Fallback to individual calls
      const results = await Promise.allSettled(
        normalizedAssets.map(async (asset) => {
          const stake = await publicClient.readContract({
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'getOperatorStakeForAsset',
            args: [operatorAddress, { kind: asset.kind, token: asset.token }],
          });

          return { asset, stake: stake as bigint };
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { asset, stake } = result.value;
          const mapKey = asset.originalToken.toLowerCase() as Address;
          stakeMap.set(mapKey, {
            token: asset.originalToken,
            kind: asset.kind,
            totalStake: stake,
          });
        }
      }

      return stakeMap;
    },
    enabled:
      enabled &&
      !!publicClient &&
      !!contracts &&
      !!operatorAddress &&
      !!assets &&
      assets.length > 0,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 30_000,
  });
};

// Keep the old export name for backwards compatibility
export const useOperatorDelegationsByAsset = useOperatorStakeByAsset;

export default useOperatorStakeByAsset;
