/**
 * Hooks for blueprint creation and management.
 */

import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  usePublicClient,
  useWalletClient,
  useChainId,
  useAccount,
} from 'wagmi';
import { Address, encodeFunctionData, zeroAddress, type Hash } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useSnackbar } from 'notistack';
import TANGLE_ABI from '../../abi/tangle';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import useNetworkStore from '../../context/useNetworkStore';
import {
  parseBlueprintMetadataJsonText,
  resolveBlueprintMetadataFetchUrl,
} from '../../blueprintApps/authoring';
import isUserRejectionError from '../../utils/isUserRejectionError';
import useContractWrite, {
  TxStatus as ContractTxStatus,
} from '../../hooks/useContractWrite';

// Pricing model for blueprints
export type PricingModel = 'PayOnce' | 'Subscription' | 'EventDriven';

// Membership model for blueprints
export type MembershipModel = 'Fixed' | 'Dynamic';

// Blueprint source kind
export type BlueprintSourceKind = 'Container' | 'Wasm' | 'Native';

// Job definition for blueprint (matches ABI structure)
export interface JobDefinition {
  name: string;
  description: string;
  metadataUri: string;
  paramsSchema: `0x${string}`; // bytes
  resultSchema: `0x${string}`; // bytes
}

// Blueprint configuration (matches contract structure - 7 fields)
export interface BlueprintConfig {
  membership: number; // 0 = Fixed, 1 = Dynamic
  pricing: number; // 0 = PayOnce, 1 = Subscription, 2 = EventDriven
  minOperators: number;
  maxOperators: number; // 0 = unlimited
  subscriptionRate: bigint; // Per interval charge
  subscriptionInterval: bigint; // In seconds
  eventRate: bigint; // Per job charge
}

// Blueprint metadata (matches ABI structure)
export interface BlueprintMetadata {
  name: string;
  description: string;
  author: string;
  category: string;
  codeRepository: string;
  logo: string;
  website: string;
  license: string;
  profilingData: string;
}

// Blueprint source (simplified - matches ABI structure)
export interface BlueprintSource {
  kind: number; // 0 = Container, 1 = Wasm, 2 = Native, 3 = Testing
  container: {
    registry: string;
    image: string;
    tag: string;
  };
  wasm: {
    runtime: number;
    fetcher: number;
    artifactUri: string;
    entrypoint: string;
  };
  native: {
    fetcher: number;
    artifactUri: string;
    entrypoint: string;
  };
  testing: {
    cargoPackage: string;
    cargoBin: string;
    basePath: string;
  };
  binaries: Array<{
    arch: number;
    os: number;
    name: string;
    sha256: `0x${string}`;
  }>;
}

// Supported memberships - array of membership model enum values (0 = Fixed, 1 = Dynamic)
export type SupportedMemberships = number[];

// Blueprint definition for creation (matches ABI structure)
export interface BlueprintDefinition {
  metadataUri: string; // IPFS or HTTPS URL
  metadataHash: `0x${string}`;
  manager: Address; // Service manager contract (address(0) for none)
  masterManagerRevision: number;
  hasConfig: boolean;
  config: BlueprintConfig;
  metadata: BlueprintMetadata;
  jobs: JobDefinition[];
  registrationSchema: `0x${string}`; // bytes
  requestSchema: `0x${string}`; // bytes
  sources: BlueprintSource[];
  supportedMemberships: SupportedMemberships; // Array of enum values (0 = Fixed, 1 = Dynamic)
}

// Blueprint owned by the user
export interface OwnedBlueprint {
  id: bigint;
  name: string;
  description: string;
  owner: Address;
  manager: Address | null;
  metadataUri: string | null;
  metadataHash?: `0x${string}` | null;
  metadata: {
    name?: string;
    description?: string;
    author?: string;
    logo?: string;
    website?: string;
    codeRepository?: string;
    docs?: string;
  };
  active: boolean;
  operatorCount: number;
  serviceCount: number;
  createdAt: bigint;
}

// Raw response from GraphQL
interface BlueprintsByOwnerResponse {
  Blueprint: Array<{
    id: string;
    blueprintId: string;
    owner: string;
    manager: string | null;
    metadataUri: string | null;
    metadataHash: `0x${string}` | null;
    active: boolean;
    operatorCount: string;
    createdAt: string;
  }>;
}

const METADATA_FETCH_TIMEOUT_MS = 5_000;

const readString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

// Fetch blueprints owned by an address
const fetchBlueprintsByOwner = async (
  owner: Address,
  network?: EnvioNetwork,
): Promise<OwnedBlueprint[]> => {
  const query = `
    query GetBlueprintsByOwner($owner: String!) {
      Blueprint(
        where: { owner: { _eq: $owner } }
        order_by: { createdAt: desc }
      ) {
        id
        blueprintId
        owner
        manager
        metadataUri
        metadataHash
        active
        operatorCount
        createdAt
      }
    }
  `;

  try {
    const result = await executeEnvioGraphQL<
      BlueprintsByOwnerResponse,
      { owner: string }
    >(query, { owner: owner.toLowerCase() }, network);

    // Fetch metadata for each blueprint
    const blueprints = await Promise.all(
      (result.data.Blueprint ?? []).map(async (bp) => {
        let name = 'Unknown Blueprint';
        let description = '';
        let metadata: OwnedBlueprint['metadata'] = {};

        if (bp.metadataUri) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(
              () => controller.abort(),
              METADATA_FETCH_TIMEOUT_MS,
            );
            const response = await fetch(
              resolveBlueprintMetadataFetchUrl(bp.metadataUri),
              {
                signal: controller.signal,
                cache: 'no-store',
              },
            ).finally(() => {
              clearTimeout(timeoutId);
            });

            if (!response.ok) {
              throw new Error(`Failed to fetch metadata: ${response.status}`);
            }

            const metadataText = await response.text();
            const { parsed, rawMetadata } =
              parseBlueprintMetadataJsonText(metadataText);
            const metadataJson = rawMetadata;

            name = parsed.name ?? name;
            description = parsed.description ?? '';
            metadata = {
              name: parsed.name,
              description: parsed.description,
              author: parsed.author,
              logo: parsed.imageUrl ?? undefined,
              website: parsed.website ?? undefined,
              codeRepository: parsed.codeUrl ?? undefined,
              docs:
                metadataJson !== null
                  ? (readString(metadataJson.docs) ??
                    readString(metadataJson.documentation))
                  : undefined,
            };
          } catch (error) {
            console.warn('Failed to fetch owned blueprint metadata', {
              operation: 'ownedBlueprintMetadataFetch',
              blueprintId: bp.blueprintId,
              metadataUri: bp.metadataUri,
              error,
            });
          }
        }

        return {
          id: BigInt(bp.blueprintId),
          name,
          description,
          owner: bp.owner as Address,
          manager: bp.manager as Address | null,
          metadataUri: bp.metadataUri,
          metadataHash: bp.metadataHash,
          metadata,
          active: bp.active,
          operatorCount: Number(bp.operatorCount),
          serviceCount: 0, // NOTE: Get from indexer when available
          createdAt: BigInt(bp.createdAt),
        };
      }),
    );

    return blueprints;
  } catch (error) {
    // Owned-blueprints discovery is GraphQL-only today (no chain-read
    // fallback for the by-owner index). Networks without a configured Envio
    // endpoint surface as an empty list rather than a red console error.
    if (typeof console !== 'undefined' && console.debug) {
      console.debug(
        '[fetchOwnedBlueprints] returning empty list — Envio fetch unavailable:',
        error instanceof Error ? error.message : error,
      );
    }
    return [];
  }
};

/**
 * Hook to fetch blueprints owned by the connected user.
 */
export const useBlueprintsByOwner = (options?: {
  network?: EnvioNetwork;
  enabled?: boolean;
}) => {
  const { network, enabled = true } = options ?? {};
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);
  const resolvedNetwork = network ?? getEnvioNetworkFromChainId(activeChainId);

  return useQuery({
    queryKey: [
      'blueprints',
      'byOwner',
      address,
      resolvedNetwork,
      activeChainId,
    ],
    queryFn: async () => {
      if (!address) return [];
      return fetchBlueprintsByOwner(address, resolvedNetwork);
    },
    enabled: enabled && !!address,
    staleTime: 60_000, // 1 minute
  });
};

// Transaction status
export type TxStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Hook to create a new blueprint.
 */
export const useCreateBlueprintTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const createBlueprint = useCallback(
    async (definition: BlueprintDefinition): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        // Encode the createBlueprint call
        // Note: The actual encoding depends on the contract's expected format
        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'createBlueprint',
          args: [definition],
        });

        const hash = await walletClient.sendTransaction({
          to: contracts.tangle,
          data,
        });

        await publicClient.waitForTransactionReceipt({ hash });

        setStatus('success');
        return hash;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to create blueprint');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    createBlueprint,
    status,
    error,
    reset,
  };
};

const mapContractTxStatus = (status: ContractTxStatus): TxStatus => {
  switch (status) {
    case ContractTxStatus.PROCESSING:
      return 'pending';
    case ContractTxStatus.COMPLETE:
      return 'success';
    case ContractTxStatus.ERROR:
      return 'error';
    default:
      return 'idle';
  }
};

/**
 * Hook to update blueprint metadata.
 */
export const useUpdateBlueprintTx = () => {
  const chainId = useChainId();

  const {
    execute,
    status: contractStatus,
    error,
    reset,
  } = useContractWrite(
    TANGLE_ABI,
    (params: {
      blueprintId: bigint;
      metadataUri: string;
      metadataHash: `0x${string}`;
    }) => {
      const contracts = getContractsByChainId(chainId);

      return {
        address: contracts.tangle,
        abi: TANGLE_ABI,
        functionName: 'updateBlueprint' as const,
        args: [
          params.blueprintId,
          params.metadataUri,
          params.metadataHash,
        ] as const,
      };
    },
    {
      txName: 'update blueprint metadata',
      getSuccessMessage: () => 'Blueprint metadata updated successfully',
    },
  );

  const updateBlueprint = useCallback(
    async (
      blueprintId: bigint,
      metadataUri: string,
      metadataHash: `0x${string}`,
    ): Promise<Hash | null> => {
      const result = await execute?.({
        blueprintId,
        metadataUri,
        metadataHash,
      });
      return result?.hash ?? null;
    },
    [execute],
  );

  return {
    updateBlueprint,
    status: mapContractTxStatus(contractStatus),
    error,
    reset,
  };
};

/**
 * Hook to transfer blueprint ownership.
 */
export const useTransferBlueprintTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');

  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { enqueueSnackbar } = useSnackbar();

  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  const transferBlueprint = useCallback(
    async (blueprintId: bigint, newOwner: Address): Promise<Hash | null> => {
      if (!walletClient || !publicClient || !userAddress) {
        enqueueSnackbar('Wallet not connected', { variant: 'error' });
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');

        let contracts: ReturnType<typeof getContractsByChainId>;
        try {
          contracts = getContractsByChainId(chainId);
        } catch {
          throw new Error('Tangle contract not available on this network');
        }

        const tangleAddress = contracts.tangle;
        if (tangleAddress === zeroAddress) {
          throw new Error('Tangle contract not available on this network');
        }

        // Simulate the contract call first to get better error messages
        const { request } = await (publicClient as any).simulateContract({
          address: tangleAddress,
          abi: TANGLE_ABI,
          functionName: 'transferBlueprint' as const,
          args: [blueprintId, newOwner] as const,
          account: userAddress,
        });

        const hash = await walletClient.writeContract(request);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'reverted') {
          throw new Error('Transaction reverted');
        }

        setStatus('success');
        return hash;
      } catch (err) {
        // Handle user cancellation separately
        if (isUserRejectionError(err)) {
          enqueueSnackbar('Blueprint transfer cancelled', {
            variant: 'warning',
          });
          setStatus('idle');
          return null;
        }

        // Determine error message for known errors
        let errorMessage = 'Failed to transfer blueprint. Please try again.';
        if (err instanceof Error) {
          if (
            err.message.includes('Failed to fetch') ||
            err.message.includes('fetch failed')
          ) {
            errorMessage =
              'Cannot connect to the network. Please check your connection.';
          } else if (err.message.includes('NotBlueprintOwner')) {
            errorMessage = 'You are not the owner of this blueprint.';
          } else if (err.message.includes('BlueprintNotFound')) {
            errorMessage = 'Blueprint not found.';
          } else if (err.message.includes('BlueprintNotActive')) {
            errorMessage = 'Blueprint is not active.';
          } else if (err.message.includes('execution reverted')) {
            errorMessage = 'Transaction failed. Please try again.';
          }
        }

        enqueueSnackbar(errorMessage, { variant: 'error' });
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient, userAddress, enqueueSnackbar],
  );

  return {
    transferBlueprint,
    status,
    reset,
  };
};

/**
 * Hook to deactivate a blueprint.
 */
export const useDeactivateBlueprintTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');

  const chainId = useChainId();
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { enqueueSnackbar } = useSnackbar();

  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  const deactivateBlueprint = useCallback(
    async (blueprintId: bigint): Promise<Hash | null> => {
      if (!walletClient || !publicClient || !userAddress) {
        enqueueSnackbar('Wallet not connected', { variant: 'error' });
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');

        let contracts: ReturnType<typeof getContractsByChainId>;
        try {
          contracts = getContractsByChainId(chainId);
        } catch {
          throw new Error('Tangle contract not available on this network');
        }

        const tangleAddress = contracts.tangle;
        if (tangleAddress === zeroAddress) {
          throw new Error('Tangle contract not available on this network');
        }

        // Simulate the contract call first to get better error messages
        const { request } = await (publicClient as any).simulateContract({
          address: tangleAddress,
          abi: TANGLE_ABI,
          functionName: 'deactivateBlueprint' as const,
          args: [blueprintId] as const,
          account: userAddress,
        });

        const hash = await walletClient.writeContract(request);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'reverted') {
          throw new Error('Transaction reverted');
        }

        setStatus('success');
        return hash;
      } catch (err) {
        // Handle user cancellation separately
        if (isUserRejectionError(err)) {
          enqueueSnackbar('Blueprint deactivation cancelled', {
            variant: 'warning',
          });
          setStatus('idle');
          return null;
        }

        // Determine error message for known errors
        let errorMessage = 'Failed to deactivate blueprint. Please try again.';
        if (err instanceof Error) {
          if (
            err.message.includes('Failed to fetch') ||
            err.message.includes('fetch failed')
          ) {
            errorMessage =
              'Cannot connect to the network. Please check your connection.';
          } else if (err.message.includes('NotBlueprintOwner')) {
            errorMessage = 'You are not the owner of this blueprint.';
          } else if (err.message.includes('BlueprintNotFound')) {
            errorMessage = 'Blueprint not found.';
          } else if (err.message.includes('BlueprintNotActive')) {
            errorMessage = 'Blueprint is already deactivated.';
          } else if (err.message.includes('execution reverted')) {
            errorMessage = 'Transaction failed. Please try again.';
          }
        }

        enqueueSnackbar(errorMessage, { variant: 'error' });
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient, userAddress, enqueueSnackbar],
  );

  return {
    deactivateBlueprint,
    status,
    reset,
  };
};

export default useBlueprintsByOwner;
