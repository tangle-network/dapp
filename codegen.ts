import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

export const DEFAULT_GRAPHQL_ENDPOINT =
  'https://mainnet-gql.tangle.tools/graphql';

const VITE_GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT ?? DEFAULT_GRAPHQL_ENDPOINT;

console.log('VITE_GRAPHQL_ENDPOINT', VITE_GRAPHQL_ENDPOINT);

const config: CodegenConfig = {
  schema: VITE_GRAPHQL_ENDPOINT,
  documents: ['apps/*/src/**/*.ts', 'apps/*/src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    'libs/tangle-shared-ui/src/graphql/': {
      preset: 'client',
      config: {
        defaultScalarType: 'unknown',
        documentMode: 'string',
        enumsAsTypes: true,
        scalars: {
          BigFloat: 'string',
          Date: 'Date',
          Datetime: 'Date',
        },
      },
    },
  },
};

export default config;
