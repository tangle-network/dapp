/**
 * Placeholder types for GraphQL codegen.
 * These will be replaced by the actual generated types when the Envio indexer is deployed.
 * This file exists to allow the build to pass without the indexer being available.
 *
 * TODO: Remove this file once Envio indexer is deployed and codegen can run properly.
 */

// Network type enum (from the indexer schema)
export type NetworkType = 'MAINNET' | 'TESTNET';

// GraphQL typed document string interface
export interface TypedDocumentString<TResult, TVariables> {
  __apiType?: (variables: TVariables) => TResult;
  toString(): string;
}

// Placeholder for any missing types that codegen would generate
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigInt: { input: bigint; output: bigint };
  BigFloat: { input: string; output: string };
  Date: { input: Date; output: Date };
  Datetime: { input: Date; output: Date };
  JSON: { input: unknown; output: unknown };
};

// Export empty object for gql function placeholder
export const gql = (
  strings: TemplateStringsArray,
  ...values: unknown[]
): string => {
  return strings.reduce((acc, str, i) => {
    return acc + str + (values[i] ?? '');
  }, '');
};

// Alias for compatibility with gql.tada/codegen style imports
export const graphql = gql;
