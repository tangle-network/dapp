import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const VITE_GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT ??
  'https://testnet-gql.tangle.tools/graphql';

const config: CodegenConfig = {
  schema: VITE_GRAPHQL_ENDPOINT,
  documents: ['apps/tangle-dapp/src/**/*.ts', 'apps/tangle-dapp/src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    'apps/tangle-dapp/src/graphql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
    'apps/tangle-dapp/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
