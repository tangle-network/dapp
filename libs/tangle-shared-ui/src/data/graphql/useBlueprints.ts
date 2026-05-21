/**
 * Hooks for fetching blueprints from the Envio indexer.
 */

import { useQuery } from '@tanstack/react-query';
import { Address } from 'viem';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import {
  executeEnvioGraphQL,
  EnvioNetwork,
  getEnvioNetworkFromChainId,
} from '../../utils/executeEnvioGraphQL';
import { fetchBlueprintsOnChain } from '../blueprints/fetchBlueprintsOnChain';
import useNetworkStore from '../../context/useNetworkStore';
import type { Blueprint as AppBlueprint } from '../../types/blueprint';
import {
  parseBlueprintMetadataJsonText,
  resolveBlueprintMetadataFetchUrls,
  verifyBlueprintMetadataIntegrity,
} from '../../blueprintApps/authoring';
import type {
  BlueprintMetadataVerification,
  BlueprintUiContract,
} from '../../blueprintApps/types';

const unavailableMetadata = (
  metadataUri: string | null,
): {
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
} => ({
  name: 'Onchain Blueprint',
  description: metadataUri
    ? 'Metadata endpoint unavailable'
    : 'Metadata not published yet',
  author: 'Unspecified publisher',
  category: 'Other',
  imageUrl: null,
  codeUrl: null,
  website: null,
  rawMetadata: null,
  metadataVerification: {
    status: metadataUri ? 'invalid' : 'unverified',
    productionReady: false,
    source: metadataUri?.startsWith('ipfs://')
      ? 'ipfs'
      : metadataUri
        ? 'http'
        : 'missing',
    reason: metadataUri
      ? 'Metadata endpoint unavailable or invalid.'
      : 'Metadata not published yet.',
  },
  blueprintUi: null,
});

const isBareHttpMetadataEndpoint = (metadataUri: string): boolean => {
  if (metadataUri.startsWith('ipfs://')) {
    return false;
  }

  try {
    const url = new URL(metadataUri);
    return url.pathname === '/' && url.search === '' && url.hash === '';
  } catch {
    return false;
  }
};

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

const useResolvedEnvioNetwork = (network?: EnvioNetwork) => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const networkChainId = useNetworkStore((store) => store.network2?.evmChainId);
  const activeChainId = isConnected ? chainId : (networkChainId ?? chainId);

  return {
    activeChainId,
    resolvedNetwork: network ?? getEnvioNetworkFromChainId(activeChainId),
  };
};

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
}): Promise<{
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
    return unavailableMetadata(metadataUri);
  }

  if (isBareHttpMetadataEndpoint(metadataUri)) {
    return unavailableMetadata(metadataUri);
  }

  // GitHub repo URIs expand to BOTH `main` and `master` candidates; try
  // them in order so repos that default to `master` (legacy MPC blueprints,
  // anything yarbed pre-2020) don't return as `unavailableMetadata`.
  const candidates = resolveBlueprintMetadataFetchUrls(metadataUri);
  try {
    let response: Response | null = null;
    let lastStatus = 0;
    for (const candidate of candidates) {
      const attempt = await fetch(candidate, {
        signal: AbortSignal.timeout(5000),
      });
      if (attempt.ok) {
        response = attempt;
        break;
      }
      lastStatus = attempt.status;
    }
    if (response === null) {
      throw new Error(`Failed to fetch metadata: ${lastStatus}`);
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
    return unavailableMetadata(metadataUri);
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
  const { activeChainId, resolvedNetwork } = useResolvedEnvioNetwork(network);
  const publicClient = usePublicClient({ chainId: activeChainId });

  return useQuery({
    queryKey: [
      'envio',
      'blueprints',
      resolvedNetwork,
      activeChainId,
      activeOnly,
      limit,
    ],
    queryFn: async () => {
      // Primary path: hosted Envio indexer.
      try {
        const blueprints = await fetchBlueprints(
          resolvedNetwork,
          activeOnly,
          limit,
          0,
        );
        // If the indexer is up but lagging (returns 0 while the chain
        // has blueprints), fall through to chain-reads so the user
        // doesn't see an empty catalog despite there being live data.
        if (blueprints.length > 0) {
          return blueprints;
        }
      } catch (err) {
        // Indexer endpoint missing or unreachable — log once and
        // fall through to the chain-read fallback below. We don't
        // re-throw because the on-chain path is the explicit recovery
        // strategy, not an error to surface to the user.
        console.warn(
          `[useBlueprints] Envio indexer fetch failed (${resolvedNetwork}); ` +
            'falling back to direct chain reads.',
          err,
        );
      }

      // Fallback: read blueprints straight off the Tangle contract.
      // Bounded by `limit`, defaults to 100 — fine for the testnet
      // scale of a few dozen entries.
      if (!publicClient || !activeChainId) {
        return [];
      }
      return fetchBlueprintsOnChain(publicClient, activeChainId, {
        limit,
        activeOnly,
      });
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
  const { activeChainId, resolvedNetwork } = useResolvedEnvioNetwork(network);
  const publicClient = usePublicClient({ chainId: activeChainId });

  return useQuery({
    queryKey: [
      'envio',
      'blueprintsWithMetadata',
      resolvedNetwork,
      activeChainId,
      activeOnly,
      limit,
    ],
    queryFn: async () => {
      // Mirror the indexer → chain-read fallback strategy from
      // `useBlueprints`. Without it, the home page's "Registered
      // Blueprints" section renders empty whenever the Envio indexer
      // isn't configured for the active network (e.g. testnet today),
      // even though the chain has live entries.
      let blueprints: Blueprint[] = [];
      try {
        blueprints = await fetchBlueprints(
          resolvedNetwork,
          activeOnly,
          limit,
          0,
        );
      } catch (err) {
        console.warn(
          `[useBlueprintsWithMetadata] Envio indexer fetch failed (${resolvedNetwork}); ` +
            'falling back to direct chain reads.',
          err,
        );
      }
      if (blueprints.length === 0 && publicClient && activeChainId) {
        blueprints = await fetchBlueprintsOnChain(publicClient, activeChainId, {
          limit,
          activeOnly,
        });
      }

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
  const { activeChainId, resolvedNetwork } = useResolvedEnvioNetwork(network);

  return useQuery({
    queryKey: [
      'envio',
      'blueprint',
      blueprintId,
      resolvedNetwork,
      activeChainId,
    ],
    queryFn: async () => {
      if (!blueprintId) return null;

      const blueprint = await fetchBlueprintById(blueprintId, resolvedNetwork);
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
  const { activeChainId, resolvedNetwork } = useResolvedEnvioNetwork(network);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [
      'envio',
      'blueprintDetails',
      blueprintId?.toString(),
      resolvedNetwork,
      activeChainId,
    ],
    queryFn: async (): Promise<BlueprintDetailsResult | null> => {
      if (blueprintId === undefined) return null;

      const idString = blueprintId.toString();
      const blueprint = await fetchBlueprintById(idString, resolvedNetwork);
      if (!blueprint) return null;

      const [metadata, operators] = await Promise.all([
        fetchBlueprintMetadata({
          metadataUri: blueprint.metadataUri,
          metadataHash: blueprint.metadataHash,
          blueprintId: blueprint.blueprintId,
          owner: blueprint.owner,
        }),
        fetchBlueprintOperators(idString, resolvedNetwork),
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
