/**
 * Hook to fetch an operator's stake per asset from the MultiAssetDelegation contract.
 * Used to display tokens at risk in service approval flows.
 */

import { useQuery } from '@tanstack/react-query';
import { Address, zeroAddress } from 'viem';
import { useChainId, usePublicClient } from 'wagmi';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import MULTI_ASSET_DELEGATION_ABI from '../../abi/multiAssetDelegation';

const ASSET_KIND_NATIVE = 0;

interface Asset {
  kind: number;
  token: Address;
}

export interface OperatorStakeByAsset {
  token: Address;
  kind: number;
  totalStake: bigint;
}

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
      'stakingOperatorStakeByAsset',
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

      const normalizedAssets = assets.map((asset) => {
        const isNativeAsset =
          asset.kind === ASSET_KIND_NATIVE || asset.token === zeroAddress;

        return {
          kind: isNativeAsset ? ASSET_KIND_NATIVE : asset.kind,
          token: isNativeAsset ? zeroAddress : asset.token,
          originalToken: asset.token,
        };
      });

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
              stakeMap.set(asset.originalToken.toLowerCase() as Address, {
                token: asset.originalToken,
                kind: asset.kind,
                totalStake: stake,
              });
            }
          }

          return stakeMap;
        } catch {
          // Fall through to individual calls.
        }
      }

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
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
};

/** @deprecated Use `useOperatorStakeByAsset`. */
export const useOperatorDelegationsByAsset = useOperatorStakeByAsset;

export default useOperatorStakeByAsset;
