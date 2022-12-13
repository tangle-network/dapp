const isDev = process.env.NODE_ENV === 'development';

export const defaultEndpoint = isDev
  ? 'https://tangle-subquery.webb.tools/graphql'
  : 'https://tangle-subquery.webb.tools/graphql';

export const polkadotProviderEndpoint = 'wss://tangle-archive.webb.tools/';
