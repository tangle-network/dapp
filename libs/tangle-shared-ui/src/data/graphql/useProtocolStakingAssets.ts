/**
 * Hooks for fetching protocol staking asset configs from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import {
  executeEnvioGraphQL,
  gql,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';

export interface ProtocolStakingAsset {
  id: string;
  token: Address;
  enabled: boolean;
  minOperatorStake: bigint;
  minDelegation: bigint;
  depositCap: bigint | null;
  currentDeposits: bigint;
  rewardMultiplierBps: number;
  createdAt: bigint;
  updatedAt: bigint;
}

export type StakingConfigAsset = ProtocolStakingAsset;
/** @deprecated Use `ProtocolStakingAsset`. */
export type StakingAssetConfig = ProtocolStakingAsset;

const STAKING_ASSETS_QUERY = gql`
  query StakingAssets($enabled: Boolean) {
    StakingAsset(where: { enabled: { _eq: $enabled } }, order_by: { createdAt: asc }) {
      id
      token
      enabled
      minOperatorStake
      minDelegation
      depositCap
      currentDeposits
      rewardMultiplierBps
      createdAt
      updatedAt
    }
  }
`;

interface StakingAssetsQueryResult {
  StakingAsset: Array<{
    id: string;
    token: string;
    enabled: boolean;
    minOperatorStake: string;
    minDelegation: string;
    depositCap: string | null;
    currentDeposits: string;
    rewardMultiplierBps: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const parseStakingAsset = (
  raw: StakingAssetsQueryResult['StakingAsset'][number],
): ProtocolStakingAsset => ({
  id: raw.id || raw.token,
  token: raw.token as Address,
  enabled: raw.enabled,
  minOperatorStake: BigInt(raw.minOperatorStake),
  minDelegation: BigInt(raw.minDelegation),
  depositCap: raw.depositCap ? BigInt(raw.depositCap) : null,
  currentDeposits: BigInt(raw.currentDeposits),
  rewardMultiplierBps: raw.rewardMultiplierBps,
  createdAt: BigInt(raw.createdAt),
  updatedAt: BigInt(raw.updatedAt),
});

const fetchProtocolStakingAssets = async (
  network?: EnvioNetwork,
  enabledOnly?: boolean,
): Promise<ProtocolStakingAsset[]> => {
  const result = await executeEnvioGraphQL<
    StakingAssetsQueryResult,
    { enabled?: boolean }
  >(STAKING_ASSETS_QUERY, { enabled: enabledOnly }, network);

  return result.data.StakingAsset.map(parseStakingAsset);
};

export const useProtocolStakingAssets = (options?: {
  network?: EnvioNetwork;
  enabledOnly?: boolean;
  enabled?: boolean;
}) => {
  const { network, enabledOnly = true, enabled = true } = options ?? {};
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: ['envio', 'stakingAssets', resolvedNetwork, enabledOnly],
    queryFn: () => fetchProtocolStakingAssets(resolvedNetwork, enabledOnly),
    enabled,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
};

export const useProtocolStakingAssetMap = (options?: {
  network?: EnvioNetwork;
  enabledOnly?: boolean;
  enabled?: boolean;
}) => {
  const { network, enabledOnly = true, enabled = true } = options ?? {};
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: ['envio', 'stakingAssetMap', resolvedNetwork, enabledOnly],
    queryFn: async () => {
      const assets = await fetchProtocolStakingAssets(resolvedNetwork, enabledOnly);
      const map = new Map<Address, ProtocolStakingAsset>();
      for (const asset of assets) {
        map.set(asset.token, asset);
      }
      return map;
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });
};

export const useProtocolStakingAssetIds = (options?: {
  network?: EnvioNetwork;
  enabledOnly?: boolean;
  enabled?: boolean;
}) => {
  const { data: assets, ...rest } = useProtocolStakingAssets(options);

  return {
    ...rest,
    data: assets?.map((a) => a.token) ?? null,
  };
};

/** @deprecated Use `useProtocolStakingAssets`. */
export const useStakingAssetConfigs = useProtocolStakingAssets;
/** @deprecated Use `useProtocolStakingAssetMap`. */
export const useStakingAssetConfigMap = useProtocolStakingAssetMap;
/** @deprecated Use `useProtocolStakingAssetIds`. */
export const useStakingAssetConfigIds = useProtocolStakingAssetIds;

export default useProtocolStakingAssets;
