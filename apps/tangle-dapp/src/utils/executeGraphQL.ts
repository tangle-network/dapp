import { DEFAULT_GRAPHQL_ENDPOINT } from '@webb-tools/dapp-config/constants/graphql';
import type { TypedDocumentString } from '../graphql/graphql';

const ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT ?? DEFAULT_GRAPHQL_ENDPOINT;

export async function executeGraphQL<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
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
