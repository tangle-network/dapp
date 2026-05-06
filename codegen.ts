import type { CodegenConfig } from '@graphql-codegen/cli';
import 'dotenv/config';
import fs from 'node:fs';

// Legacy Substrate indexer endpoint (to be removed in v2)
export const LEGACY_GRAPHQL_ENDPOINT =
  'https://mainnet-gql.tangle.tools/graphql';

// New Envio indexer endpoint (v2 EVM) - Hasura serves at /v1/graphql
export const ENVIO_LOCAL_ENDPOINT = 'http://localhost:8080/v1/graphql';
export const ENVIO_TESTNET_ENDPOINT =
  process.env.VITE_ENVIO_TESTNET_ENDPOINT ?? ENVIO_LOCAL_ENDPOINT;
export const ENVIO_MAINNET_ENDPOINT =
  process.env.VITE_ENVIO_MAINNET_ENDPOINT ?? ENVIO_LOCAL_ENDPOINT;

// Prefer local checked-in schema when present; otherwise fall back to a live endpoint.
const ENVIO_SCHEMA_FILE = './libs/tangle-shared-ui/src/graphql/envio.schema.graphql';
const DEFAULT_MAINNET_ENDPOINT = 'https://mainnet-gql.tangle.tools/v1/graphql';
const hasLocalSchemaFile = fs.existsSync(ENVIO_SCHEMA_FILE);
const VITE_GRAPHQL_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT ??
  (hasLocalSchemaFile
    ? ENVIO_SCHEMA_FILE
    : process.env.VITE_ENVIO_MAINNET_ENDPOINT ?? DEFAULT_MAINNET_ENDPOINT);

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
