/**
 * Execute GraphQL queries against the Envio indexer.
 * This is the v2 EVM-based indexer, replacing the legacy Substrate indexer.
 */

// Network type for Envio (simplified - just chain-based)
export type EnvioNetwork = 'local' | 'testnet' | 'mainnet';

// Envio indexer endpoints
// Note: Hasura commonly serves GraphQL at /v1/graphql, but deployments may also expose it at /graphql.
const DEFAULT_LOCAL_ENDPOINT = 'http://localhost:8080/v1/graphql';
const ENVIO_ENDPOINTS: Partial<Record<EnvioNetwork, string>> = {
  local: import.meta.env.VITE_ENVIO_LOCAL_ENDPOINT,
  testnet: import.meta.env.VITE_ENVIO_TESTNET_ENDPOINT,
  mainnet: import.meta.env.VITE_ENVIO_MAINNET_ENDPOINT,
};
let hasWarnedLegacyEndpointFallback = false;

// Get current network from environment
export const getEnvioNetwork = (): EnvioNetwork => {
  const env = import.meta.env.MODE;
  if (env === 'production') return 'mainnet';
  if (env === 'staging' || env === 'testnet') return 'testnet';
  return 'local';
};

// Map chain ID to Envio network
export const getEnvioNetworkFromChainId = (chainId: number): EnvioNetwork => {
  switch (chainId) {
    case 31337: // Anvil/Hardhat local
      return 'local';
    case 84532: // Base Sepolia
    case 421614: // Arbitrum Sepolia
      return 'testnet';
    case 8453: // Base Mainnet
    case 42161: // Arbitrum One
      return 'mainnet';
    default:
      // Fall back to the build-mode based network if the chain ID isn't explicitly mapped.
      return getEnvioNetwork();
  }
};

// Get the Envio endpoint for a given network
export const getEnvioEndpoint = (network?: EnvioNetwork): string => {
  const resolvedNetwork = network ?? getEnvioNetwork();
  const networkEndpoint = ENVIO_ENDPOINTS[resolvedNetwork];
  if (typeof networkEndpoint === 'string' && networkEndpoint.length > 0) {
    return networkEndpoint;
  }

  // Legacy fallback for existing deployments/docs still using one global endpoint.
  // Prefer network-specific endpoints whenever possible.
  const legacyOverride = import.meta.env.VITE_GRAPHQL_ENDPOINT;
  if (typeof legacyOverride === 'string' && legacyOverride.length > 0) {
    if (resolvedNetwork !== 'local' && !hasWarnedLegacyEndpointFallback) {
      console.warn(
        `Using VITE_GRAPHQL_ENDPOINT as fallback for ${resolvedNetwork}. ` +
          'Set VITE_ENVIO_TESTNET_ENDPOINT / VITE_ENVIO_MAINNET_ENDPOINT to avoid chain/indexer drift.',
      );
      hasWarnedLegacyEndpointFallback = true;
    }
    return legacyOverride;
  }

  if (resolvedNetwork === 'local') {
    return DEFAULT_LOCAL_ENDPOINT;
  }

  throw new Error(
    `No Envio GraphQL endpoint configured for ${resolvedNetwork}. ` +
      `Set VITE_ENVIO_${resolvedNetwork.toUpperCase()}_ENDPOINT.`,
  );
};

// Type for GraphQL query documents
export interface TypedDocumentString<TResult, TVariables> {
  __apiType?: (variables: TVariables) => TResult;
  toString(): string;
}

// Execute a GraphQL query against the Envio indexer
export async function executeEnvioGraphQL<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables> | string,
  variables?: TVariables,
  network?: EnvioNetwork,
): Promise<{ data: TResult; errors?: Array<{ message: string }> }> {
  const endpoint = getEnvioEndpoint(network);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
    },
    body: JSON.stringify({
      query: typeof query === 'string' ? query : query.toString(),
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    console.error('GraphQL errors:', result.errors);
  }

  return result as { data: TResult; errors?: Array<{ message: string }> };
}

// Simple GraphQL template tag for creating typed queries
// This is a placeholder until codegen types are generated
export const gql = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): string => {
  return strings.reduce((acc, str, i) => {
    return acc + str + (values[i] ?? '');
  }, '');
};
