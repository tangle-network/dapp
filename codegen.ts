import { DEFAULT_GRAPHQL_ENDPOINT } from './libs/dapp-config/src/constants/graphql';
import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

const VITE_GRAPHQL_ENDPOINT = process.env.VITE_GRAPHQL_ENDPOINT ?? DEFAULT_GRAPHQL_ENDPOINT;

const config: CodegenConfig = {
  schema: VITE_GRAPHQL_ENDPOINT,
  documents: [
    'apps/tangle-dapp/src/**/*.ts',
    'apps/tangle-dapp/src/**/*.tsx',
    'apps/tangle-cloud/src/**/*.ts',
    'apps/tangle-cloud/src/**/*.tsx',
  ],
  ignoreNoDocuments: true,
  generates: {
    'libs/tangle-shared-ui/src/graphql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
        scalars: {
          BigFloat: 'string',
        },
      },
    },
    'libs/tangle-shared-ui/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
