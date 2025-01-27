import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

console.log('VITE_GRAPHQL_ENDPOINT', process.env.VITE_GRAPHQL_ENDPOINT);

const config: CodegenConfig = {
  schema: process.env.VITE_GRAPHQL_ENDPOINT,
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
