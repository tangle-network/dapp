/**
 * Execute GraphQL queries against the Envio indexer.
 * This is the v2 EVM-based indexer, replacing the legacy Substrate indexer.
 */

// Network type for Envio (simplified - just chain-based)
export type EnvioNetwork = 'local' | 'testnet' | 'mainnet';

// Envio indexer endpoints
// Note: Hasura serves GraphQL at /v1/graphql
const ENVIO_ENDPOINTS: Record<EnvioNetwork, string> = {
  local:
    import.meta.env.VITE_ENVIO_LOCAL_ENDPOINT ??
    'http://localhost:8080/v1/graphql',
  testnet:
    import.meta.env.VITE_ENVIO_TESTNET_ENDPOINT ??
    'http://localhost:8080/v1/graphql',
  mainnet:
    import.meta.env.VITE_ENVIO_MAINNET_ENDPOINT ??
    'http://localhost:8080/v1/graphql',
};

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
    case 84532: // Base Sepolia (local testnet)
      return 'local';
    case 421614: // Arbitrum Sepolia
      return 'testnet';
    case 8453: // Base Mainnet
    case 42161: // Arbitrum One
      return 'mainnet';
    default:
      return 'local';
  }
};

// Get the Envio endpoint for a given network
export const getEnvioEndpoint = (network?: EnvioNetwork): string => {
  return ENVIO_ENDPOINTS[network ?? getEnvioNetwork()];
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
