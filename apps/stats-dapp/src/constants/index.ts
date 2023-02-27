const isDev = process.env.NODE_ENV === 'development';

export const defaultEndpoint = isDev
  ? 'https://standalone-subql.webb.tools/graphql'
  : 'https://standalone-subql.webb.tools/graphql';

export const polkadotProviderEndpoint =
  'wss://tangle-standalone-archive.webb.tools';
