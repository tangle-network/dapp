/**
 * Hook for fetching staking assets with metadata and balances.
 * Falls back to on-chain asset discovery when the indexer is unavailable.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Address, erc20Abi, zeroAddress } from 'viem';
import {
  useAccount,
  useBalance,
  useChainId,
  useConnectorClient,
  usePublicClient,
} from 'wagmi';
import { readContract } from 'viem/actions';
import {
  useProtocolStakingAssets,
  type ProtocolStakingAsset as ProtocolStakingAssetConfig,
} from './useProtocolStakingAssets';
import {
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import { useEnvioHealthCheckByChainId } from '../../utils/checkEnvioHealth';
import { useEvmAssetMetadatas } from '../../hooks/useEvmAssetMetadatas';
import useOnChainStakingAssets from '../staking/useOnChainStakingAssets';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import useNetworkStore from '../../context/useNetworkStore';

const NATIVE_TOKEN_ADDRESS = zeroAddress as Address;

const ERC20_BALANCE_CACHE = new Map<string, bigint>();
const BALANCE_WARNED_KEYS = new Set<string>();

export type StakingTokenMetadata = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
};

export type TokenMetadata = StakingTokenMetadata;

export type ProtocolStakingAsset = ProtocolStakingAssetConfig;
export type StakingAsset = {
  id: Address;
  metadata: StakingTokenMetadata;
  balance: bigint | null;
  stakingInfo: ProtocolStakingAssetConfig;
  /** @deprecated Use `stakingInfo`. */
  restakingInfo?: ProtocolStakingAssetConfig;
};

export type StakingAssetMap = Map<Address, StakingAsset>;

type LegacyAssetLike = {
  id: Address | string;
  metadata: {
    address?: Address | string;
    name: string;
    symbol: string;
    decimals: number;
  };
  balance?: bigint | null;
  stakingInfo?: ProtocolStakingAssetConfig;
  restakingInfo?: ProtocolStakingAssetConfig;
};

const isNetworkishError = (error: unknown): boolean => {
  const message = String((error as any)?.message ?? error);
  return (
    message.includes('Failed to fetch') ||
    message.includes('NetworkError') ||
    message.includes('ECONNREFUSED') ||
    message.includes('timeout') ||
    message.includes('timed out')
  );
};

const isZeroDataDecodeError = (error: unknown): boolean => {
  const message = String((error as any)?.message ?? error);
  return message.includes('Cannot decode zero data ("0x")');
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeAsset = (asset: LegacyAssetLike): StakingAsset | null => {
  const stakingInfo = asset.stakingInfo ?? asset.restakingInfo;
  if (!stakingInfo) {
    return null;
  }

  const assetAddress =
    typeof asset.id === 'string' && asset.id.startsWith('0x')
      ? (asset.id as Address)
      : null;
  if (assetAddress === null) {
    return null;
  }

  return {
    id: assetAddress,
    metadata: {
      address: assetAddress,
      name: asset.metadata.name,
      symbol: asset.metadata.symbol,
      decimals: asset.metadata.decimals,
    },
    balance: asset.balance ?? null,
    stakingInfo,
    restakingInfo: stakingInfo,
  };
};

export const useStakingAssets = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const chainId = useChainId();
  const { address: userAddress, isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const publicClient = usePublicClient({ chainId: activeChainId });
  const { data: connectorClient } = useConnectorClient();
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  const {
    data: nativeBalanceData,
    isLoading: isLoadingNativeBalance,
    refetch: refetchNativeBalance,
  } = useBalance({
    address: userAddress,
    chainId: activeChainId,
    query: {
      enabled: Boolean(userAddress),
      refetchInterval: 30_000,
    },
  });

  const nativeBalance = nativeBalanceData?.value ?? BigInt(0);
  const nativeDecimals = nativeBalanceData?.decimals ?? 18;
  const nativeSymbol = nativeBalanceData?.symbol ?? 'ETH';

  const { data: isIndexerHealthy, isLoading: isCheckingHealth } =
    useEnvioHealthCheckByChainId(activeChainId);

  const healthCheckComplete = !isCheckingHealth;
  const useGraphQL = healthCheckComplete && isIndexerHealthy === true;
  const useOnChainFallback = healthCheckComplete && !isIndexerHealthy;

  const onChainResult = useOnChainStakingAssets({
    enabled: enabled && useOnChainFallback,
  });

  const {
    data: stakingAssetConfigs,
    isLoading: isLoadingAssets,
    refetch: refetchAssets,
  } = useProtocolStakingAssets({
    network: resolvedNetwork,
    enabledOnly: true,
    enabled: enabled && useGraphQL,
  });

  const erc20TokenAddresses = useMemo(() => {
    if (!stakingAssetConfigs) return [];
    return stakingAssetConfigs
      .map((a) => a.token)
      .filter(
        (addr) => addr.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase(),
      );
  }, [stakingAssetConfigs]);

  const { data: tokenMetadatas, isLoading: isLoadingMetadata } =
    useEvmAssetMetadatas(
      useGraphQL ? (erc20TokenAddresses as EvmAddress[]) : [],
    );

  const {
    data: balances,
    isLoading: isLoadingBalances,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: [
      'erc20Balances',
      userAddress,
      erc20TokenAddresses,
      publicClient?.chain?.id,
    ],
    queryFn: async () => {
      if (!publicClient || !userAddress || erc20TokenAddresses.length === 0) {
        return new Map<Address, bigint>();
      }

      const cacheKeyPrefix = `${publicClient.chain?.id ?? activeChainId}:${userAddress.toLowerCase()}`;
      const cacheKeyForToken = (token: Address) =>
        `${cacheKeyPrefix}:${token.toLowerCase()}`;

      const readBalance = async (token: Address): Promise<bigint> => {
        const readViaPublic = async () =>
          (await publicClient.readContract({
            address: token,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
          })) as bigint;

        const readViaConnector = async () => {
          if (!connectorClient) {
            throw new Error('Connector client not available');
          }

          return (await readContract(connectorClient, {
            address: token,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [userAddress],
          })) as bigint;
        };

        try {
          return await readViaPublic();
        } catch (primaryError) {
          if (isZeroDataDecodeError(primaryError)) {
            await delay(75);
            try {
              return await readViaPublic();
            } catch {
              // fall through
            }
          }

          if (!connectorClient) {
            throw primaryError;
          }

          try {
            return await readViaConnector();
          } catch (connectorError) {
            if (isZeroDataDecodeError(connectorError)) {
              await delay(75);
              return await readViaConnector();
            }
            throw connectorError;
          }
        }
      };

      try {
        const accountHasCachedBalances = Array.from(
          ERC20_BALANCE_CACHE.keys(),
        ).some((k) => k.startsWith(cacheKeyPrefix));

        let hadRetryableFailure = false;

        if (publicClient.chain?.contracts?.multicall3?.address === undefined) {
          const fallbackBalances = new Map<Address, bigint>();
          await Promise.allSettled(
            erc20TokenAddresses.map(async (token) => {
              try {
                const balance = await readBalance(token);
                ERC20_BALANCE_CACHE.set(cacheKeyForToken(token), balance);
                fallbackBalances.set(token, balance);
              } catch (fallbackError) {
                const key = cacheKeyForToken(token);
                const cached = ERC20_BALANCE_CACHE.get(key) ?? BigInt(0);
                const retryable = isZeroDataDecodeError(fallbackError);

                if (!BALANCE_WARNED_KEYS.has(key)) {
                  BALANCE_WARNED_KEYS.add(key);
                  console.warn(
                    '[useStakingAssets] Failed to fetch balance via direct call.',
                    {
                      token,
                      message: String(
                        (fallbackError as any)?.message ?? fallbackError,
                      ),
                    },
                  );
                }

                fallbackBalances.set(token, cached);

                if (retryable) {
                  hadRetryableFailure = true;
                }

                if (isNetworkishError(fallbackError) || retryable) {
                  throw fallbackError;
                }
              }
            }),
          );

          if (hadRetryableFailure && !accountHasCachedBalances) {
            throw new Error('Retryable ERC20 balance fetch failure');
          }

          return fallbackBalances;
        }

        const calls = erc20TokenAddresses.map((token) => ({
          address: token,
          abi: erc20Abi,
          functionName: 'balanceOf' as const,
          args: [userAddress] as const,
        }));

        const results = await publicClient.multicall({ contracts: calls });
        const balanceMap = new Map<Address, bigint>();
        const failedTokens: Address[] = [];

        results.forEach((result, index) => {
          const token = erc20TokenAddresses[index];
          if (result.status === 'success') {
            const balance = result.result as bigint;
            ERC20_BALANCE_CACHE.set(cacheKeyForToken(token), balance);
            balanceMap.set(token, balance);
          } else {
            failedTokens.push(token);
          }
        });

        if (failedTokens.length > 0) {
          console.warn(
            '[useStakingAssets] Multicall returned failures for balances; falling back to individual balanceOf calls.',
            {
              chainId: publicClient.chain?.id,
              failedCount: failedTokens.length,
              totalCount: erc20TokenAddresses.length,
            },
          );

          await Promise.allSettled(
            failedTokens.map(async (token) => {
              try {
                const balance = await readBalance(token);
                ERC20_BALANCE_CACHE.set(cacheKeyForToken(token), balance);
                balanceMap.set(token, balance);
              } catch (fallbackError) {
                const key = cacheKeyForToken(token);
                const cached = ERC20_BALANCE_CACHE.get(key) ?? BigInt(0);
                const retryable = isZeroDataDecodeError(fallbackError);

                if (!BALANCE_WARNED_KEYS.has(key)) {
                  BALANCE_WARNED_KEYS.add(key);
                  console.warn(
                    '[useStakingAssets] Failed to fetch balance via direct call.',
                    {
                      token,
                      message: String(
                        (fallbackError as any)?.message ?? fallbackError,
                      ),
                    },
                  );
                }

                balanceMap.set(token, cached);

                if (retryable) {
                  hadRetryableFailure = true;
                }

                if (isNetworkishError(fallbackError) || retryable) {
                  throw fallbackError;
                }
              }
            }),
          );
        }

        if (hadRetryableFailure && !accountHasCachedBalances) {
          throw new Error('Retryable ERC20 balance fetch failure');
        }

        return balanceMap;
      } catch (error) {
        console.warn(
          '[useStakingAssets] Multicall failed for balances, falling back to individual balanceOf calls.',
          error,
        );

        const cacheKeyPrefix = `${publicClient.chain?.id ?? chainId}:${userAddress.toLowerCase()}`;
        const accountHasCachedBalances = Array.from(
          ERC20_BALANCE_CACHE.keys(),
        ).some((k) => k.startsWith(cacheKeyPrefix));
        let hadRetryableFailure = false;

        const fallbackBalances = new Map<Address, bigint>();
        await Promise.allSettled(
          erc20TokenAddresses.map(async (token) => {
            try {
              const balance = await readBalance(token);
              ERC20_BALANCE_CACHE.set(cacheKeyForToken(token), balance);
              fallbackBalances.set(token, balance);
            } catch (fallbackError) {
              const key = cacheKeyForToken(token);
              const cached = ERC20_BALANCE_CACHE.get(key) ?? BigInt(0);
              const retryable = isZeroDataDecodeError(fallbackError);

              if (!BALANCE_WARNED_KEYS.has(key)) {
                BALANCE_WARNED_KEYS.add(key);
                console.warn(
                  '[useStakingAssets] Failed to fetch balance via direct call.',
                  {
                    token,
                    message: String(
                      (fallbackError as any)?.message ?? fallbackError,
                    ),
                  },
                );
              }

              fallbackBalances.set(token, cached);

              if (retryable) {
                hadRetryableFailure = true;
              }

              if (isNetworkishError(fallbackError) || retryable) {
                throw fallbackError;
              }
            }
          }),
        );

        if (hadRetryableFailure && !accountHasCachedBalances) {
          throw new Error('Retryable ERC20 balance fetch failure');
        }

        return fallbackBalances;
      }
    },
    enabled:
      enabled &&
      !useOnChainFallback &&
      !!publicClient &&
      erc20TokenAddresses.length > 0,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: 1,
    retryDelay: 500,
  });

  const graphqlAssets = useMemo(() => {
    if (useOnChainFallback || !stakingAssetConfigs) {
      return null;
    }

    const assetMap = new Map<Address, StakingAsset>();

    for (const stakingConfig of stakingAssetConfigs) {
      const isNativeToken =
        stakingConfig.token.toLowerCase() ===
        NATIVE_TOKEN_ADDRESS.toLowerCase();

      if (isNativeToken) {
        assetMap.set(NATIVE_TOKEN_ADDRESS, {
          id: NATIVE_TOKEN_ADDRESS,
          metadata: {
            address: NATIVE_TOKEN_ADDRESS,
            name: nativeSymbol,
            symbol: nativeSymbol,
            decimals: nativeDecimals,
          },
          balance: nativeBalance ?? null,
          stakingInfo: stakingConfig,
          restakingInfo: stakingConfig,
        });
        continue;
      }

      const metadata = tokenMetadatas?.find(
        (m) => m.id.toLowerCase() === stakingConfig.token.toLowerCase(),
      );

      const fallbackMetadata = getCachedTokenMetadata(
        chainId,
        stakingConfig.token,
      );
      const balance = balances?.get(stakingConfig.token) ?? BigInt(0);
      const tokenMetadata = metadata ??
        fallbackMetadata ?? {
          name: `Token ${stakingConfig.token.slice(0, 8)}...`,
          symbol: `${stakingConfig.token.slice(0, 6)}...${stakingConfig.token.slice(-4)}`,
          decimals: 18,
        };

      assetMap.set(stakingConfig.token, {
        id: stakingConfig.token,
        metadata: {
          address: stakingConfig.token,
          name: tokenMetadata.name,
          symbol: tokenMetadata.symbol,
          decimals: tokenMetadata.decimals,
        },
        balance,
        stakingInfo: stakingConfig,
        restakingInfo: stakingConfig,
      });
    }

    return assetMap;
  }, [
    useOnChainFallback,
    stakingAssetConfigs,
    tokenMetadatas,
    balances,
    nativeBalance,
    nativeSymbol,
    nativeDecimals,
    chainId,
  ]);

  const onChainAssets = useMemo(() => {
    if (!useOnChainFallback || !onChainResult.assets) {
      return null;
    }

    const map = new Map<Address, StakingAsset>();
    for (const [token, asset] of (
      onChainResult.assets as Map<Address, LegacyAssetLike>
    ).entries()) {
      const normalized = normalizeAsset(asset);
      if (normalized) {
        map.set(token, normalized);
      }
    }

    return map;
  }, [useOnChainFallback, onChainResult.assets]);

  const refetch = async () => {
    if (useOnChainFallback) {
      await onChainResult.refetch();
    } else {
      await Promise.all([
        refetchAssets(),
        refetchBalances(),
        refetchNativeBalance(),
      ]);
    }
  };

  if (isCheckingHealth) {
    return {
      assets: null as StakingAssetMap | null,
      assetList: [] as StakingAsset[],
      isLoading: true,
      isLoadingBalances: false,
      refetch,
      refetchBalances,
      source: 'loading' as const,
    };
  }

  if (useOnChainFallback) {
    const fallbackAssets = onChainAssets ?? new Map<Address, StakingAsset>();

    return {
      assets: fallbackAssets,
      assetList: Array.from(fallbackAssets.values()),
      isLoading: onChainResult.isLoading,
      isLoadingBalances: onChainResult.isLoadingBalances,
      refetch,
      refetchBalances: onChainResult.refetchBalances,
      source: 'onchain' as const,
    };
  }

  return {
    assets: graphqlAssets ?? null,
    assetList: graphqlAssets ? Array.from(graphqlAssets.values()) : [],
    isLoading: isLoadingAssets || isLoadingMetadata || isLoadingNativeBalance,
    isLoadingBalances,
    refetch,
    refetchBalances,
    source: 'graphql' as const,
  };
};

export const useStakingAsset = (
  tokenAddress: Address | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { assets, isLoading, isLoadingBalances, refetch } =
    useStakingAssets(options);

  return {
    asset: tokenAddress ? (assets?.get(tokenAddress) ?? null) : null,
    isLoading,
    isLoadingBalances,
    refetch,
  };
};

export const useNativeStakingBalance = () => {
  const { address } = useAccount();
  const { data, isLoading, refetch } = useBalance({
    address,
    query: {
      enabled: Boolean(address),
      refetchInterval: 30_000,
    },
  });

  return {
    balance: data?.value ?? BigInt(0),
    decimals: data?.decimals ?? 18,
    symbol: data?.symbol ?? 'ETH',
    isLoading,
    refetch,
  };
};

/** @deprecated Use `useStakingAssets`. */
export const useSubstrateStakingAssets = useStakingAssets;
/** @deprecated Use `useNativeStakingBalance`. */
export const useNativeBalance = useNativeStakingBalance;

export default useStakingAssets;
