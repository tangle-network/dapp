import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';

// Legacy Substrate indexer endpoint (to be removed in v2)
export const LEGACY_GRAPHQL_ENDPOINT =
  'https://mainnet-gql.tangle.tools/graphql';

// New Envio indexer endpoint (v2 EVM) - Hasura serves at /v1/graphql
export const ENVIO_LOCAL_ENDPOINT = 'http://localhost:8080/v1/graphql';
export const ENVIO_TESTNET_ENDPOINT =
  process.env.VITE_ENVIO_TESTNET_ENDPOINT ?? ENVIO_LOCAL_ENDPOINT;
export const ENVIO_MAINNET_ENDPOINT =
  process.env.VITE_ENVIO_MAINNET_ENDPOINT ?? ENVIO_LOCAL_ENDPOINT;

// Use local schema file for codegen (works without running indexer)
// Override with VITE_GRAPHQL_ENDPOINT env var to use live endpoint
const ENVIO_SCHEMA_FILE = './libs/tangle-shared-ui/src/graphql/envio.schema.graphql';
const VITE_GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT ?? ENVIO_SCHEMA_FILE;

console.log('VITE_GRAPHQL_ENDPOINT', VITE_GRAPHQL_ENDPOINT);

const config: CodegenConfig = {
  schema: VITE_GRAPHQL_ENDPOINT,
  documents: [
    'apps/*/src/**/*.ts',
    'apps/*/src/**/*.tsx',
    'libs/*/src/**/*.ts',
    'libs/*/src/**/*.tsx',
  ],
  ignoreNoDocuments: true,
  generates: {
    'libs/tangle-shared-ui/src/graphql/': {
      preset: 'client',
      config: {
        defaultScalarType: 'unknown',
        documentMode: 'string',
        enumsAsTypes: true,
        scalars: {
          // Envio uses BigInt for large numbers
          BigInt: 'bigint',
          BigFloat: 'string',
          Date: 'Date',
          Datetime: 'Date',
          // Envio ID types
          ID: 'string',
        },
      },
    },
  },
};

export default config;
