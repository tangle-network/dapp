/**
 * Hooks for fetching blueprints from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
} from '../../utils/executeEnvioGraphQL';
import type { Blueprint as AppBlueprint } from '../../types/blueprint';

// Raw Blueprint type from Envio indexer
export interface Blueprint {
  id: string;
  blueprintId: bigint;
  owner: Address;
  manager: Address | null;
  metadataUri: string | null;
  active: boolean;
  createdAt: bigint;
  updatedAt: bigint;
  operatorCount: bigint;
  serviceCount?: number;
}

// Blueprint with metadata fetched from URI
export interface BlueprintWithMetadata extends Blueprint {
  name: string;
  description: string;
  author: string;
  category: string;
  imageUrl: string | null;
  codeUrl: string | null;
  website: string | null;
}

// Convert BlueprintWithMetadata to app Blueprint type
const toAppBlueprint = (bp: BlueprintWithMetadata): AppBlueprint => ({
  id: bp.blueprintId,
  name: bp.name,
  author: bp.author,
  deployer: bp.owner,
  registrationParams: [], // Will be populated from on-chain data if needed
  requestParams: [], // Will be populated from on-chain data if needed
  imgUrl: bp.imageUrl,
  category: bp.category,
  description: bp.description,
  instancesCount: bp.serviceCount ?? null,
  operatorsCount: Number(bp.operatorCount),
  restakersCount: null, // TODO: Query from indexer
  tvl: null, // TODO: Calculate from indexer data
  isBoosted: false,
  githubUrl: bp.codeUrl,
  websiteUrl: bp.website,
  twitterUrl: null,
  email: null,
});

// Raw response from GraphQL
interface BlueprintQueryResponse {
  Blueprint: Array<{
    id: string;
    blueprintId: string;
    owner: string;
    manager: string | null;
    metadataUri: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    operatorCount: string;
  }>;
}

// Parse blueprint metadata from IPFS or other URI
const fetchBlueprintMetadata = async (
  metadataUri: string | null,
): Promise<{
  name: string;
  description: string;
  author: string;
  category: string;
  imageUrl: string | null;
  codeUrl: string | null;
  website: string | null;
}> => {
  if (!metadataUri) {
    return {
      name: 'Unknown Blueprint',
      description: 'No metadata available',
      author: 'Unknown',
      category: 'Other',
      imageUrl: null,
      codeUrl: null,
      website: null,
    };
  }

  try {
    // Handle IPFS URIs
    let fetchUrl = metadataUri;
    if (metadataUri.startsWith('ipfs://')) {
      const cid = metadataUri.replace('ipfs://', '');
      fetchUrl = `https://ipfs.io/ipfs/${cid}`;
    }

    const response = await fetch(fetchUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const metadata = await response.json();

    return {
      name: metadata.name ?? 'Unknown Blueprint',
      description: metadata.description ?? 'No description',
      author: metadata.author ?? 'Unknown',
      category: metadata.category ?? 'Other',
      imageUrl: metadata.image ?? metadata.imageUrl ?? null,
      codeUrl: metadata.codeUrl ?? metadata.repository ?? null,
      website: metadata.website ?? metadata.homepage ?? null,
    };
  } catch (error) {
    console.error('Failed to fetch blueprint metadata:', error);
    return {
      name: 'Unknown Blueprint',
      description: 'Failed to load metadata',
      author: 'Unknown',
      category: 'Other',
      imageUrl: null,
      codeUrl: null,
      website: null,
    };
  }
};

// Fetch blueprints from GraphQL
const fetchBlueprints = async (
  network?: EnvioNetwork,
  activeOnly = true,
  limit = 100,
  offset = 0,
): Promise<Blueprint[]> => {
  const query = `
    query GetBlueprints($limit: Int!, $offset: Int!, $active: Boolean) {
      Blueprint(
        limit: $limit
        offset: $offset
        where: { active: { _eq: $active } }
        order_by: { createdAt: desc }
      ) {
        id
        blueprintId
        owner
        manager
        metadataUri
        active
        createdAt
        updatedAt
        operatorCount
      }
    }
  `;

  const result = await executeEnvioGraphQL<BlueprintQueryResponse, {
    limit: number;
    offset: number;
    active?: boolean;
  }>(query, { limit, offset, active: activeOnly ? true : undefined }, network);

  if (result.errors?.length) {
    console.error('GraphQL errors:', result.errors);
  }

  return (result.data.Blueprint ?? []).map((bp) => ({
    id: bp.id,
    blueprintId: BigInt(bp.blueprintId),
    owner: bp.owner as Address,
    manager: bp.manager as Address | null,
    metadataUri: bp.metadataUri,
    active: bp.active,
    createdAt: BigInt(bp.createdAt),
    updatedAt: BigInt(bp.updatedAt),
    operatorCount: BigInt(bp.operatorCount),
  }));
};

// Fetch single blueprint by ID
const fetchBlueprintById = async (
  blueprintId: string,
  network?: EnvioNetwork,
): Promise<Blueprint | null> => {
  const query = `
    query GetBlueprint($id: String!) {
      Blueprint_by_pk(id: $id) {
        id
        blueprintId
        owner
        manager
        metadataUri
        active
        createdAt
        updatedAt
        operatorCount
      }
    }
  `;

  const result = await executeEnvioGraphQL<{
    Blueprint_by_pk: BlueprintQueryResponse['Blueprint'][0] | null;
  }, { id: string }>(query, { id: blueprintId }, network);

  if (!result.data.Blueprint_by_pk) {
    return null;
  }

  const bp = result.data.Blueprint_by_pk;
  return {
    id: bp.id,
    blueprintId: BigInt(bp.blueprintId),
    owner: bp.owner as Address,
    manager: bp.manager as Address | null,
    metadataUri: bp.metadataUri,
    active: bp.active,
    createdAt: BigInt(bp.createdAt),
    updatedAt: BigInt(bp.updatedAt),
    operatorCount: BigInt(bp.operatorCount),
  };
};

/**
 * Hook to fetch all blueprints from the indexer.
 */
export const useBlueprints = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
  limit?: number;
}) => {
  const { network, activeOnly = true, enabled = true, limit = 100 } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'blueprints', network, activeOnly, limit],
    queryFn: async () => {
      const blueprints = await fetchBlueprints(network, activeOnly, limit, 0);
      return blueprints;
    },
    enabled,
    staleTime: 60_000, // 1 minute
  });
};

/**
 * Hook to fetch blueprints with metadata from their URIs.
 * This does an additional fetch for each blueprint's metadataUri.
 */
export const useBlueprintsWithMetadata = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
  limit?: number;
}) => {
  const { network, activeOnly = true, enabled = true, limit = 100 } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'blueprintsWithMetadata', network, activeOnly, limit],
    queryFn: async () => {
      const blueprints = await fetchBlueprints(network, activeOnly, limit, 0);

      // Fetch metadata for all blueprints in parallel
      const blueprintsWithMetadata = await Promise.all(
        blueprints.map(async (bp): Promise<BlueprintWithMetadata> => {
          const metadata = await fetchBlueprintMetadata(bp.metadataUri);
          return { ...bp, ...metadata };
        }),
      );

      return blueprintsWithMetadata;
    },
    enabled,
    staleTime: 300_000, // 5 minutes - metadata doesn't change often
  });
};

/**
 * Hook to fetch blueprints as a Map keyed by blueprint ID string.
 * Returns data in the format expected by existing components (app Blueprint type).
 */
export const useBlueprintMap = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
}) => {
  const { data: blueprints, ...rest } = useBlueprintsWithMetadata(options);

  const blueprintMap = blueprints
    ? new Map(blueprints.map((bp) => [bp.blueprintId.toString(), toAppBlueprint(bp)]))
    : new Map<string, AppBlueprint>();

  return {
    ...rest,
    blueprints: blueprintMap,
  };
};

/**
 * Type for useAllBlueprints return value.
 */
export type UseAllBlueprintsReturn = {
  blueprints: Map<string, AppBlueprint>;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Hook to fetch all blueprints with metadata.
 * Returns data in the format expected by existing components.
 */
export const useAllBlueprints = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
}): UseAllBlueprintsReturn => {
  const { blueprints, isLoading, error } = useBlueprintMap(options);

  return {
    blueprints,
    isLoading,
    error: error ?? null,
  };
};

/**
 * Hook to fetch a single blueprint by ID.
 */
export const useBlueprint = (
  blueprintId: string | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'blueprint', blueprintId, network],
    queryFn: async () => {
      if (!blueprintId) return null;

      const blueprint = await fetchBlueprintById(blueprintId, network);
      if (!blueprint) return null;

      const metadata = await fetchBlueprintMetadata(blueprint.metadataUri);
      return { ...blueprint, ...metadata } as BlueprintWithMetadata;
    },
    enabled: enabled && !!blueprintId,
    staleTime: 300_000,
  });
};

// Operator info for blueprint details (compatible with RestakeOperator type)
export interface BlueprintOperator {
  address: string; // EVM address - will be converted for display
  identityName?: string;
  concentrationPercentage: number | null;
  restakersCount: number;
  selfBondedAmount: bigint;
  tvlInUsd: number | null;
  vaultTokens: Array<{ name?: string; symbol: string; amount: { toNumber: () => number } }>;
  isDelegated: boolean;
  instanceCount: number;
}

// Blueprint details response
export interface BlueprintDetailsResult {
  details: AppBlueprint;
  operators: BlueprintOperator[];
}

// Fetch operators registered for a blueprint
const fetchBlueprintOperators = async (
  blueprintId: string,
  network?: EnvioNetwork,
): Promise<BlueprintOperator[]> => {
  const query = `
    query GetBlueprintOperators($blueprintId: String!) {
      OperatorBlueprint(
        where: { blueprintId: { _eq: $blueprintId } }
      ) {
        operator {
          id
          delegationCount
          stake
          status
        }
      }
    }
  `;

  try {
    const result = await executeEnvioGraphQL<{
      OperatorBlueprint: Array<{
        operator: {
          id: string;
          delegationCount: string;
          stake: string;
          status: string;
        };
      }>;
    }, { blueprintId: string }>(query, { blueprintId }, network);

    return (result.data.OperatorBlueprint ?? []).map((ob) => ({
      address: ob.operator.id,
      identityName: undefined,
      concentrationPercentage: null,
      restakersCount: Number(ob.operator.delegationCount),
      selfBondedAmount: BigInt(ob.operator.stake),
      tvlInUsd: null,
      vaultTokens: [], // Will be populated when we have delegation data
      isDelegated: false,
      instanceCount: 0,
    }));
  } catch (error) {
    console.error('Failed to fetch blueprint operators:', error);
    return [];
  }
};

/**
 * Hook to fetch a single blueprint with its registered operators.
 */
export const useBlueprintDetails = (
  blueprintId: bigint | undefined,
  options?: {
    network?: EnvioNetwork;
    enabled?: boolean;
  },
) => {
  const { network, enabled = true } = options ?? {};

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['envio', 'blueprintDetails', blueprintId?.toString(), network],
    queryFn: async (): Promise<BlueprintDetailsResult | null> => {
      if (blueprintId === undefined) return null;

      const idString = blueprintId.toString();
      const blueprint = await fetchBlueprintById(idString, network);
      if (!blueprint) return null;

      const [metadata, operators] = await Promise.all([
        fetchBlueprintMetadata(blueprint.metadataUri),
        fetchBlueprintOperators(idString, network),
      ]);

      const blueprintWithMetadata = { ...blueprint, ...metadata };

      return {
        details: toAppBlueprint(blueprintWithMetadata),
        operators,
      };
    },
    enabled: enabled && blueprintId !== undefined,
    staleTime: 60_000,
  });

  return {
    result: data ?? null,
    isLoading,
    error: error ?? null,
    refetch,
  };
};

export default useBlueprints;
