import type { NetworkType, TypedDocumentString } from '../graphql/graphql';

export async function executeGraphQL<TResult, TVariables>(
  network: NetworkType,
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const endpoint = getGraphQLEndpointFromNetwork(network);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json() as Promise<{ data: TResult }>;
}

const getGraphQLEndpointFromNetwork = (network: NetworkType) => {
  switch (network) {
    case 'MAINNET':
      return (
        import.meta.env.VITE_ENVIO_MAINNET_ENDPOINT ||
        'http://localhost:8080/v1/graphql'
      );
    case 'TESTNET':
      return (
        import.meta.env.VITE_ENVIO_TESTNET_ENDPOINT ||
        'http://localhost:8080/v1/graphql'
      );
    default:
      throw new Error(`Invalid network: ${network}`);
  }
};
