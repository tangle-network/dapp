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
import { Address, encodeFunctionData, type Hash } from 'viem';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import TANGLE_ABI from '../../abi/tangle';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';

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

// Blueprint configuration (matches ABI structure)
export interface BlueprintConfig {
  membership: number; // 0 = Fixed, 1 = Dynamic
  pricing: number; // 0 = PayOnce, 1 = Subscription, 2 = EventDriven
  minOperators: number;
  maxOperators: number; // 0 = unlimited
  subscriptionRate: bigint; // Per interval charge
  subscriptionInterval: bigint; // In seconds
  eventRate: bigint; // Per job charge
  operatorBond: bigint; // 0 = use global default
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
    active: boolean;
    operatorCount: string;
    createdAt: string;
  }>;
}

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

        if (bp.metadataUri) {
          try {
            let fetchUrl = bp.metadataUri;
            if (bp.metadataUri.startsWith('ipfs://')) {
              const cid = bp.metadataUri.replace('ipfs://', '');
              fetchUrl = `https://ipfs.io/ipfs/${cid}`;
            }
            const response = await fetch(fetchUrl, {
              signal: AbortSignal.timeout(5000),
            });
            if (response.ok) {
              const metadata = await response.json();
              name = metadata.name ?? name;
              description = metadata.description ?? '';
            }
          } catch {
            // Ignore metadata fetch errors
          }
        }

        return {
          id: BigInt(bp.blueprintId),
          name,
          description,
          owner: bp.owner as Address,
          manager: bp.manager as Address | null,
          active: bp.active,
          operatorCount: Number(bp.operatorCount),
          serviceCount: 0, // TODO: Get from indexer when available
          createdAt: BigInt(bp.createdAt),
        };
      }),
    );

    return blueprints;
  } catch (error) {
    console.error('Failed to fetch owned blueprints:', error);
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
  const { address } = useAccount();

  return useQuery({
    queryKey: ['blueprints', 'byOwner', address, network],
    queryFn: async () => {
      if (!address) return [];
      return fetchBlueprintsByOwner(address, network);
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

/**
 * Hook to update blueprint metadata.
 */
export const useUpdateBlueprintTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const updateBlueprint = useCallback(
    async (blueprintId: bigint, metadataUri: string): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'updateBlueprint',
          args: [blueprintId, metadataUri],
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
          err instanceof Error ? err : new Error('Failed to update blueprint');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    updateBlueprint,
    status,
    error,
    reset,
  };
};

/**
 * Hook to transfer blueprint ownership.
 */
export const useTransferBlueprintTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const transferBlueprint = useCallback(
    async (blueprintId: bigint, newOwner: Address): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'transferBlueprint',
          args: [blueprintId, newOwner],
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
          err instanceof Error
            ? err
            : new Error('Failed to transfer blueprint');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    transferBlueprint,
    status,
    error,
    reset,
  };
};

/**
 * Hook to deactivate a blueprint.
 */
export const useDeactivateBlueprintTx = () => {
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  const deactivateBlueprint = useCallback(
    async (blueprintId: bigint): Promise<Hash | null> => {
      if (!walletClient || !publicClient) {
        setError(new Error('Wallet not connected'));
        setStatus('error');
        return null;
      }

      try {
        setStatus('pending');
        setError(null);

        const contracts = getContractsByChainId(chainId);

        const data = encodeFunctionData({
          abi: TANGLE_ABI,
          functionName: 'deactivateBlueprint',
          args: [blueprintId],
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
          err instanceof Error
            ? err
            : new Error('Failed to deactivate blueprint');
        setError(error);
        setStatus('error');
        return null;
      }
    },
    [chainId, publicClient, walletClient],
  );

  return {
    deactivateBlueprint,
    status,
    error,
    reset,
  };
};

export default useBlueprintsByOwner;
