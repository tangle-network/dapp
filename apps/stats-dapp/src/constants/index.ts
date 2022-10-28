const isDev = process.env.NODE_ENV === 'development';

export const defaultEndpoint = isDev
  ? 'https://subquery-dev.webb.tools/graphql'
  : 'https://subquery-dev.webb.tools/graphql';
