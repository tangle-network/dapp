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
import {
  parseBlueprintMetadataJsonText,
  resolveBlueprintMetadataFetchUrl,
  verifyBlueprintMetadataIntegrity,
} from '../../blueprintApps/authoring';
import type {
  BlueprintMetadataVerification,
  BlueprintUiContract,
} from '../../blueprintApps/types';

export interface Blueprint {
  id: string;
  blueprintId: bigint;
  owner: Address;
  manager: Address | null;
  metadataUri: string | null;
  metadataHash: `0x${string}` | null;
  active: boolean;
  createdAt: bigint;
  updatedAt: bigint;
  operatorCount: bigint;
  serviceCount?: number;
}

export interface BlueprintWithMetadata extends Blueprint {
  name: string;
  description: string;
  author: string;
  category: string;
  imageUrl: string | null;
  codeUrl: string | null;
  website: string | null;
  rawMetadata: Record<string, unknown> | null;
  metadataVerification: BlueprintMetadataVerification;
  blueprintUi: BlueprintUiContract | null;
}

const toAppBlueprint = (bp: BlueprintWithMetadata): AppBlueprint => ({
  id: bp.blueprintId,
  name: bp.name,
  author: bp.author,
  deployer: bp.owner,
  registrationParams: [],
  requestParams: [],
  imgUrl: bp.imageUrl,
  category: bp.category,
  description: bp.description,
  instancesCount: bp.serviceCount ?? null,
  operatorsCount: Number(bp.operatorCount),
  stakersCount: null,
  tvl: null,
  isBoosted: false,
  githubUrl: bp.codeUrl,
  websiteUrl: bp.website,
  twitterUrl: null,
  email: null,
  metadataUri: bp.metadataUri,
  metadataHash: bp.metadataHash,
  metadataVerification: bp.metadataVerification,
  blueprintUi: bp.blueprintUi,
});

interface BlueprintQueryResponse {
  Blueprint: Array<{
    id: string;
    blueprintId: string;
    owner: string;
    manager: string | null;
    metadataUri: string | null;
    metadataHash: `0x${string}` | null;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    operatorCount: string;
  }>;
}

const fetchBlueprintMetadata = async ({
  metadataUri,
  metadataHash,
  blueprintId,
  owner,
}: {
  metadataUri: string | null;
  metadataHash?: `0x${string}` | null;
  blueprintId?: bigint;
  owner?: Address;
},
): Promise<{
  name: string;
  description: string;
  author: string;
  category: string;
  imageUrl: string | null;
  codeUrl: string | null;
  website: string | null;
  rawMetadata: Record<string, unknown> | null;
  metadataVerification: BlueprintMetadataVerification;
  blueprintUi: BlueprintUiContract | null;
}> => {
  if (!metadataUri) {
    return {
      name: 'Onchain Blueprint',
      description: 'Metadata not published yet',
      author: 'Unspecified publisher',
      category: 'Other',
      imageUrl: null,
      codeUrl: null,
      website: null,
      rawMetadata: null,
      metadataVerification: {
        status: 'unverified',
        productionReady: false,
        source: 'missing',
        reason: 'Metadata not published yet.',
      },
      blueprintUi: null,
    };
  }

  try {
    const response = await fetch(resolveBlueprintMetadataFetchUrl(metadataUri), {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }

    const metadataText = await response.text();
    const { parsed, rawMetadata } =
      parseBlueprintMetadataJsonText(metadataText);
    const metadataVerification = await verifyBlueprintMetadataIntegrity({
      rawMetadata,
      metadataUri,
      metadataHash,
      blueprintId,
      owner,
    });

    return {
      ...parsed,
      rawMetadata,
      metadataVerification,
      blueprintUi:
        metadataVerification.status === 'verified'
          ? parsed.blueprintUi
          : parsed.blueprintUi
            ? { ...parsed.blueprintUi, externalApp: undefined, tier: 'generic' }
            : null,
    };
  } catch (error) {
    console.error('Failed to fetch blueprint metadata:', error);
    return {
      name: 'Onchain Blueprint',
      description: 'Metadata endpoint unavailable',
      author: 'Unspecified publisher',
      category: 'Other',
      imageUrl: null,
      codeUrl: null,
      website: null,
      rawMetadata: null,
      metadataVerification: {
        status: 'invalid',
        productionReady: false,
        source: metadataUri.startsWith('ipfs://') ? 'ipfs' : 'http',
        reason: 'Metadata endpoint unavailable or invalid.',
      },
      blueprintUi: null,
    };
  }
};

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
        metadataHash
        active
        createdAt
        updatedAt
        operatorCount
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    BlueprintQueryResponse,
    {
      limit: number;
      offset: number;
      active?: boolean;
    }
  >(query, { limit, offset, active: activeOnly ? true : undefined }, network);

  if (result.errors?.length) {
    console.error('GraphQL errors:', result.errors);
  }

  return (result.data.Blueprint ?? []).map((bp) => ({
    id: bp.id,
    blueprintId: BigInt(bp.blueprintId),
    owner: bp.owner as Address,
    manager: bp.manager as Address | null,
    metadataUri: bp.metadataUri,
    metadataHash: bp.metadataHash,
    active: bp.active,
    createdAt: BigInt(bp.createdAt),
    updatedAt: BigInt(bp.updatedAt),
    operatorCount: BigInt(bp.operatorCount),
  }));
};

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
        metadataHash
        active
        createdAt
        updatedAt
        operatorCount
      }
    }
  `;

  const result = await executeEnvioGraphQL<
    {
      Blueprint_by_pk: BlueprintQueryResponse['Blueprint'][0] | null;
    },
    { id: string }
  >(query, { id: blueprintId }, network);

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
    metadataHash: bp.metadataHash,
    active: bp.active,
    createdAt: BigInt(bp.createdAt),
    updatedAt: BigInt(bp.updatedAt),
    operatorCount: BigInt(bp.operatorCount),
  };
};

export const useBlueprints = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
  limit?: number;
}) => {
  const {
    network,
    activeOnly = true,
    enabled = true,
    limit = 100,
  } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'blueprints', network, activeOnly, limit],
    queryFn: async () => {
      const blueprints = await fetchBlueprints(network, activeOnly, limit, 0);
      return blueprints;
    },
    enabled,
    staleTime: 60_000,
  });
};

export const useBlueprintsWithMetadata = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
  limit?: number;
}) => {
  const {
    network,
    activeOnly = true,
    enabled = true,
    limit = 100,
  } = options ?? {};

  return useQuery({
    queryKey: ['envio', 'blueprintsWithMetadata', network, activeOnly, limit],
    queryFn: async () => {
      const blueprints = await fetchBlueprints(network, activeOnly, limit, 0);

      return Promise.all(
        blueprints.map(async (bp): Promise<BlueprintWithMetadata> => {
          const metadata = await fetchBlueprintMetadata({
            metadataUri: bp.metadataUri,
            metadataHash: bp.metadataHash,
            blueprintId: bp.blueprintId,
            owner: bp.owner as Address,
          });
          return { ...bp, ...metadata };
        }),
      );
    },
    enabled,
    staleTime: 300_000,
  });
};

export const useBlueprintMap = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
}) => {
  const { data: blueprints, ...rest } = useBlueprintsWithMetadata(options);

  const blueprintMap = blueprints
    ? new Map(
        blueprints.map((bp) => [bp.blueprintId.toString(), toAppBlueprint(bp)]),
      )
    : new Map<string, AppBlueprint>();

  return {
    ...rest,
    blueprints: blueprintMap,
  };
};

export type UseAllBlueprintsReturn = {
  blueprints: Map<string, AppBlueprint>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
};

export const useAllBlueprints = (options?: {
  network?: EnvioNetwork;
  activeOnly?: boolean;
  enabled?: boolean;
}): UseAllBlueprintsReturn => {
  const { blueprints, isLoading, error, refetch } = useBlueprintMap(options);

  return {
    blueprints,
    isLoading,
    error: error ?? null,
    refetch,
  };
};

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

      const metadata = await fetchBlueprintMetadata({
        metadataUri: blueprint.metadataUri,
        metadataHash: blueprint.metadataHash,
        blueprintId: blueprint.blueprintId,
        owner: blueprint.owner,
      });
      return { ...blueprint, ...metadata } as BlueprintWithMetadata;
    },
    enabled: enabled && !!blueprintId,
    staleTime: 300_000,
  });
};

export interface BlueprintOperator {
  address: string;
  identityName?: string;
  concentrationPercentage: number | null;
  stakersCount: number;
  selfBondedAmount: bigint;
  tvlInUsd: number | null;
  vaultTokens: Array<{
    name?: string;
    symbol: string;
    amount: bigint;
    decimals: number;
  }>;
  isDelegated: boolean;
  instanceCount: number;
}

export interface BlueprintDetailsResult {
  details: AppBlueprint;
  operators: BlueprintOperator[];
}

const fetchBlueprintOperators = async (
  blueprintId: string,
  network?: EnvioNetwork,
): Promise<BlueprintOperator[]> => {
  const query = `
    query GetBlueprintOperators($blueprintId: numeric!) {
      OperatorBlueprint(
        where: {
          blueprint: { blueprintId: { _eq: $blueprintId } }
          active: { _eq: true }
        }
      ) {
        operator {
          id
          stakingDelegationCount
          stakingStake
          stakingStatus
        }
      }
    }
  `;

  try {
    const result = await executeEnvioGraphQL<
      {
        OperatorBlueprint: Array<{
          operator: {
            id: string;
            stakingDelegationCount: string | null;
            stakingStake: string | null;
            stakingStatus: string | null;
          };
        }>;
      },
      { blueprintId: number }
    >(query, { blueprintId: Number(blueprintId) }, network);

    return (result.data.OperatorBlueprint ?? []).map((ob) => ({
      address: ob.operator.id,
      identityName: undefined,
      concentrationPercentage: null,
      stakersCount: Number(ob.operator.stakingDelegationCount ?? '0'),
      selfBondedAmount: BigInt(ob.operator.stakingStake ?? '0'),
      tvlInUsd: null,
      vaultTokens: [],
      isDelegated: false,
      instanceCount: 0,
    }));
  } catch (error) {
    console.error('Failed to fetch blueprint operators:', error);
    return [];
  }
};

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
        fetchBlueprintMetadata({
          metadataUri: blueprint.metadataUri,
          metadataHash: blueprint.metadataHash,
          blueprintId: blueprint.blueprintId,
          owner: blueprint.owner,
        }),
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
