const isDev = process.env.NODE_ENV === 'development';

export const defaultEndpoint = isDev
  ? 'http://localhost:4000'
  : 'https://subquery-dev.webb.tools/graphql';
