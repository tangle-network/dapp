import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigFloat: any;
  BigInt: any;
  Cursor: any;
  Date: any;
  Datetime: any;
  JSON: any;
};

export type Account = Node & {
  __typename?: 'Account';
  /** Reads and enables pagination through a set of `Account`. */
  accountsByCreatorId: AccountsConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByAccountCreatorIdAndCreateAtBlockId: AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Block`. */
  blocksByExtrinsicSignerIdAndBlockId: AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyConnection;
  /** Reads a single `Block` that is related to this `Account`. */
  createAtBlock?: Maybe<Block>;
  createAtBlockId?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['String']>;
  /** Reads a single `Account` that is related to this `Account`. */
  creator?: Maybe<Account>;
  creatorId?: Maybe<Scalars['String']>;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsicsBySignerId: ExtrinsicsConnection;
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
};

export type AccountAccountsByCreatorIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AccountFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountsOrderBy>>;
};

export type AccountBlocksByAccountCreatorIdAndCreateAtBlockIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<BlockFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<BlocksOrderBy>>;
};

export type AccountBlocksByExtrinsicSignerIdAndBlockIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<BlockFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<BlocksOrderBy>>;
};

export type AccountExtrinsicsBySignerIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ExtrinsicFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ExtrinsicsOrderBy>>;
};

export type AccountAggregates = {
  __typename?: 'AccountAggregates';
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<AccountDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A connection to a list of `Block` values, with data from `Account`. */
export type AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyConnection = {
  __typename?: 'AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** A list of edges which contains the `Block`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Block` values, with data from `Account`. */
export type AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: InputMaybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection, with data from `Account`. */
export type AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyEdge = {
  __typename?: 'AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyEdge';
  /** Reads and enables pagination through a set of `Account`. */
  accountsByCreateAtBlockId: AccountsConnection;
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
};

/** A `Block` edge in the connection, with data from `Account`. */
export type AccountBlocksByAccountCreatorIdAndCreateAtBlockIdManyToManyEdgeAccountsByCreateAtBlockIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AccountFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountsOrderBy>>;
};

/** A connection to a list of `Block` values, with data from `Extrinsic`. */
export type AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyConnection = {
  __typename?: 'AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** A list of edges which contains the `Block`, info from the `Extrinsic`, and the cursor to aid in pagination. */
  edges: Array<AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Block` values, with data from `Extrinsic`. */
export type AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: InputMaybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection, with data from `Extrinsic`. */
export type AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyEdge = {
  __typename?: 'AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsics: ExtrinsicsConnection;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
};

/** A `Block` edge in the connection, with data from `Extrinsic`. */
export type AccountBlocksByExtrinsicSignerIdAndBlockIdManyToManyEdgeExtrinsicsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ExtrinsicFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ExtrinsicsOrderBy>>;
};

export type AccountDistinctCountAggregates = {
  __typename?: 'AccountDistinctCountAggregates';
  /** Distinct count of createAtBlockId across the matching connection */
  createAtBlockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of createdAt across the matching connection */
  createdAt?: Maybe<Scalars['BigInt']>;
  /** Distinct count of creatorId across the matching connection */
  creatorId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Account` object types. All fields are combined with a logical ‘and.’ */
export type AccountFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<AccountFilter>>;
  /** Filter by the object’s `createAtBlockId` field. */
  createAtBlockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `createdAt` field. */
  createdAt?: InputMaybe<StringFilter>;
  /** Filter by the object’s `creatorId` field. */
  creatorId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<AccountFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<AccountFilter>>;
};

/** A connection to a list of `Account` values. */
export type AccountsConnection = {
  __typename?: 'AccountsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AccountAggregates>;
  /** A list of edges which contains the `Account` and cursor to aid in pagination. */
  edges: Array<AccountsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AccountAggregates>>;
  /** A list of `Account` objects. */
  nodes: Array<Maybe<Account>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Account` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Account` values. */
export type AccountsConnectionGroupedAggregatesArgs = {
  groupBy: Array<AccountsGroupBy>;
  having?: InputMaybe<AccountsHavingInput>;
};

/** A `Account` edge in the connection. */
export type AccountsEdge = {
  __typename?: 'AccountsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Account` at the end of the edge. */
  node?: Maybe<Account>;
};

/** Grouping methods for `Account` for usage during aggregation. */
export enum AccountsGroupBy {
  CreatedAt = 'CREATED_AT',
  CreateAtBlockId = 'CREATE_AT_BLOCK_ID',
  CreatorId = 'CREATOR_ID',
}

/** Conditions for `Account` aggregates. */
export type AccountsHavingInput = {
  AND?: InputMaybe<Array<AccountsHavingInput>>;
  OR?: InputMaybe<Array<AccountsHavingInput>>;
};

/** Methods to use when ordering `Account`. */
export enum AccountsOrderBy {
  AccountsByCreatorIdAverageCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_CREATED_AT_ASC',
  AccountsByCreatorIdAverageCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_CREATED_AT_DESC',
  AccountsByCreatorIdAverageCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdAverageCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdAverageCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_CREATOR_ID_ASC',
  AccountsByCreatorIdAverageCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_CREATOR_ID_DESC',
  AccountsByCreatorIdAverageIdAsc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_ID_ASC',
  AccountsByCreatorIdAverageIdDesc = 'ACCOUNTS_BY_CREATOR_ID_AVERAGE_ID_DESC',
  AccountsByCreatorIdCountAsc = 'ACCOUNTS_BY_CREATOR_ID_COUNT_ASC',
  AccountsByCreatorIdCountDesc = 'ACCOUNTS_BY_CREATOR_ID_COUNT_DESC',
  AccountsByCreatorIdDistinctCountCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_CREATED_AT_ASC',
  AccountsByCreatorIdDistinctCountCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_CREATED_AT_DESC',
  AccountsByCreatorIdDistinctCountCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdDistinctCountCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdDistinctCountCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_CREATOR_ID_ASC',
  AccountsByCreatorIdDistinctCountCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_CREATOR_ID_DESC',
  AccountsByCreatorIdDistinctCountIdAsc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_ID_ASC',
  AccountsByCreatorIdDistinctCountIdDesc = 'ACCOUNTS_BY_CREATOR_ID_DISTINCT_COUNT_ID_DESC',
  AccountsByCreatorIdMaxCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_MAX_CREATED_AT_ASC',
  AccountsByCreatorIdMaxCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_MAX_CREATED_AT_DESC',
  AccountsByCreatorIdMaxCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_MAX_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdMaxCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_MAX_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdMaxCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_MAX_CREATOR_ID_ASC',
  AccountsByCreatorIdMaxCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_MAX_CREATOR_ID_DESC',
  AccountsByCreatorIdMaxIdAsc = 'ACCOUNTS_BY_CREATOR_ID_MAX_ID_ASC',
  AccountsByCreatorIdMaxIdDesc = 'ACCOUNTS_BY_CREATOR_ID_MAX_ID_DESC',
  AccountsByCreatorIdMinCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_MIN_CREATED_AT_ASC',
  AccountsByCreatorIdMinCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_MIN_CREATED_AT_DESC',
  AccountsByCreatorIdMinCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_MIN_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdMinCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_MIN_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdMinCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_MIN_CREATOR_ID_ASC',
  AccountsByCreatorIdMinCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_MIN_CREATOR_ID_DESC',
  AccountsByCreatorIdMinIdAsc = 'ACCOUNTS_BY_CREATOR_ID_MIN_ID_ASC',
  AccountsByCreatorIdMinIdDesc = 'ACCOUNTS_BY_CREATOR_ID_MIN_ID_DESC',
  AccountsByCreatorIdStddevPopulationCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_CREATED_AT_ASC',
  AccountsByCreatorIdStddevPopulationCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_CREATED_AT_DESC',
  AccountsByCreatorIdStddevPopulationCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdStddevPopulationCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdStddevPopulationCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_CREATOR_ID_ASC',
  AccountsByCreatorIdStddevPopulationCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_CREATOR_ID_DESC',
  AccountsByCreatorIdStddevPopulationIdAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_ID_ASC',
  AccountsByCreatorIdStddevPopulationIdDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_POPULATION_ID_DESC',
  AccountsByCreatorIdStddevSampleCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_CREATED_AT_ASC',
  AccountsByCreatorIdStddevSampleCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_CREATED_AT_DESC',
  AccountsByCreatorIdStddevSampleCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdStddevSampleCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdStddevSampleCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_CREATOR_ID_ASC',
  AccountsByCreatorIdStddevSampleCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_CREATOR_ID_DESC',
  AccountsByCreatorIdStddevSampleIdAsc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_ID_ASC',
  AccountsByCreatorIdStddevSampleIdDesc = 'ACCOUNTS_BY_CREATOR_ID_STDDEV_SAMPLE_ID_DESC',
  AccountsByCreatorIdSumCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_SUM_CREATED_AT_ASC',
  AccountsByCreatorIdSumCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_SUM_CREATED_AT_DESC',
  AccountsByCreatorIdSumCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_SUM_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdSumCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_SUM_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdSumCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_SUM_CREATOR_ID_ASC',
  AccountsByCreatorIdSumCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_SUM_CREATOR_ID_DESC',
  AccountsByCreatorIdSumIdAsc = 'ACCOUNTS_BY_CREATOR_ID_SUM_ID_ASC',
  AccountsByCreatorIdSumIdDesc = 'ACCOUNTS_BY_CREATOR_ID_SUM_ID_DESC',
  AccountsByCreatorIdVariancePopulationCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_CREATED_AT_ASC',
  AccountsByCreatorIdVariancePopulationCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_CREATED_AT_DESC',
  AccountsByCreatorIdVariancePopulationCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdVariancePopulationCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdVariancePopulationCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_CREATOR_ID_ASC',
  AccountsByCreatorIdVariancePopulationCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_CREATOR_ID_DESC',
  AccountsByCreatorIdVariancePopulationIdAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_ID_ASC',
  AccountsByCreatorIdVariancePopulationIdDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_POPULATION_ID_DESC',
  AccountsByCreatorIdVarianceSampleCreatedAtAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_CREATED_AT_ASC',
  AccountsByCreatorIdVarianceSampleCreatedAtDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_CREATED_AT_DESC',
  AccountsByCreatorIdVarianceSampleCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreatorIdVarianceSampleCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreatorIdVarianceSampleCreatorIdAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_CREATOR_ID_ASC',
  AccountsByCreatorIdVarianceSampleCreatorIdDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_CREATOR_ID_DESC',
  AccountsByCreatorIdVarianceSampleIdAsc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_ID_ASC',
  AccountsByCreatorIdVarianceSampleIdDesc = 'ACCOUNTS_BY_CREATOR_ID_VARIANCE_SAMPLE_ID_DESC',
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  CreateAtBlockIdAsc = 'CREATE_AT_BLOCK_ID_ASC',
  CreateAtBlockIdDesc = 'CREATE_AT_BLOCK_ID_DESC',
  CreatorIdAsc = 'CREATOR_ID_ASC',
  CreatorIdDesc = 'CREATOR_ID_DESC',
  ExtrinsicsBySignerIdAverageArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdAverageArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdAverageBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdAverageBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdAverageBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdAverageBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdAverageHashAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_HASH_ASC',
  ExtrinsicsBySignerIdAverageHashDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_HASH_DESC',
  ExtrinsicsBySignerIdAverageIdAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_ID_ASC',
  ExtrinsicsBySignerIdAverageIdDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_ID_DESC',
  ExtrinsicsBySignerIdAverageIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_INDEX_ASC',
  ExtrinsicsBySignerIdAverageIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_INDEX_DESC',
  ExtrinsicsBySignerIdAverageIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdAverageIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdAverageIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdAverageIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdAverageMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_METHOD_ASC',
  ExtrinsicsBySignerIdAverageMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_METHOD_DESC',
  ExtrinsicsBySignerIdAverageModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_MODULE_ASC',
  ExtrinsicsBySignerIdAverageModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_MODULE_DESC',
  ExtrinsicsBySignerIdAverageSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdAverageSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_AVERAGE_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdCountAsc = 'EXTRINSICS_BY_SIGNER_ID_COUNT_ASC',
  ExtrinsicsBySignerIdCountDesc = 'EXTRINSICS_BY_SIGNER_ID_COUNT_DESC',
  ExtrinsicsBySignerIdDistinctCountArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdDistinctCountArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdDistinctCountBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdDistinctCountBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdDistinctCountBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdDistinctCountBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdDistinctCountHashAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_HASH_ASC',
  ExtrinsicsBySignerIdDistinctCountHashDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_HASH_DESC',
  ExtrinsicsBySignerIdDistinctCountIdAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_ID_ASC',
  ExtrinsicsBySignerIdDistinctCountIdDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_ID_DESC',
  ExtrinsicsBySignerIdDistinctCountIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_INDEX_ASC',
  ExtrinsicsBySignerIdDistinctCountIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_INDEX_DESC',
  ExtrinsicsBySignerIdDistinctCountIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdDistinctCountIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdDistinctCountIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdDistinctCountIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdDistinctCountMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_METHOD_ASC',
  ExtrinsicsBySignerIdDistinctCountMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_METHOD_DESC',
  ExtrinsicsBySignerIdDistinctCountModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_MODULE_ASC',
  ExtrinsicsBySignerIdDistinctCountModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_MODULE_DESC',
  ExtrinsicsBySignerIdDistinctCountSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdDistinctCountSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_DISTINCT_COUNT_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdMaxArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdMaxArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdMaxBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdMaxBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdMaxBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdMaxBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdMaxHashAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_HASH_ASC',
  ExtrinsicsBySignerIdMaxHashDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_HASH_DESC',
  ExtrinsicsBySignerIdMaxIdAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_ID_ASC',
  ExtrinsicsBySignerIdMaxIdDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_ID_DESC',
  ExtrinsicsBySignerIdMaxIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_INDEX_ASC',
  ExtrinsicsBySignerIdMaxIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_INDEX_DESC',
  ExtrinsicsBySignerIdMaxIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdMaxIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdMaxIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdMaxIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdMaxMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_METHOD_ASC',
  ExtrinsicsBySignerIdMaxMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_METHOD_DESC',
  ExtrinsicsBySignerIdMaxModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_MODULE_ASC',
  ExtrinsicsBySignerIdMaxModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_MODULE_DESC',
  ExtrinsicsBySignerIdMaxSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_MAX_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdMaxSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_MAX_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdMinArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdMinArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdMinBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdMinBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdMinBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdMinBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdMinHashAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_HASH_ASC',
  ExtrinsicsBySignerIdMinHashDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_HASH_DESC',
  ExtrinsicsBySignerIdMinIdAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_ID_ASC',
  ExtrinsicsBySignerIdMinIdDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_ID_DESC',
  ExtrinsicsBySignerIdMinIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_INDEX_ASC',
  ExtrinsicsBySignerIdMinIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_INDEX_DESC',
  ExtrinsicsBySignerIdMinIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdMinIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdMinIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdMinIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdMinMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_METHOD_ASC',
  ExtrinsicsBySignerIdMinMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_METHOD_DESC',
  ExtrinsicsBySignerIdMinModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_MODULE_ASC',
  ExtrinsicsBySignerIdMinModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_MODULE_DESC',
  ExtrinsicsBySignerIdMinSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_MIN_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdMinSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_MIN_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdStddevPopulationArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdStddevPopulationArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdStddevPopulationBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdStddevPopulationBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdStddevPopulationBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdStddevPopulationBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdStddevPopulationHashAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_HASH_ASC',
  ExtrinsicsBySignerIdStddevPopulationHashDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_HASH_DESC',
  ExtrinsicsBySignerIdStddevPopulationIdAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_ID_ASC',
  ExtrinsicsBySignerIdStddevPopulationIdDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_ID_DESC',
  ExtrinsicsBySignerIdStddevPopulationIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_INDEX_ASC',
  ExtrinsicsBySignerIdStddevPopulationIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_INDEX_DESC',
  ExtrinsicsBySignerIdStddevPopulationIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdStddevPopulationIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdStddevPopulationIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdStddevPopulationIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdStddevPopulationMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_METHOD_ASC',
  ExtrinsicsBySignerIdStddevPopulationMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_METHOD_DESC',
  ExtrinsicsBySignerIdStddevPopulationModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_MODULE_ASC',
  ExtrinsicsBySignerIdStddevPopulationModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_MODULE_DESC',
  ExtrinsicsBySignerIdStddevPopulationSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdStddevPopulationSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_POPULATION_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdStddevSampleArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdStddevSampleArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdStddevSampleBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdStddevSampleBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdStddevSampleBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdStddevSampleBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdStddevSampleHashAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_HASH_ASC',
  ExtrinsicsBySignerIdStddevSampleHashDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_HASH_DESC',
  ExtrinsicsBySignerIdStddevSampleIdAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_ID_ASC',
  ExtrinsicsBySignerIdStddevSampleIdDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_ID_DESC',
  ExtrinsicsBySignerIdStddevSampleIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_INDEX_ASC',
  ExtrinsicsBySignerIdStddevSampleIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_INDEX_DESC',
  ExtrinsicsBySignerIdStddevSampleIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdStddevSampleIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdStddevSampleIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdStddevSampleIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdStddevSampleMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_METHOD_ASC',
  ExtrinsicsBySignerIdStddevSampleMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_METHOD_DESC',
  ExtrinsicsBySignerIdStddevSampleModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_MODULE_ASC',
  ExtrinsicsBySignerIdStddevSampleModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_MODULE_DESC',
  ExtrinsicsBySignerIdStddevSampleSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdStddevSampleSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_STDDEV_SAMPLE_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdSumArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdSumArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdSumBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdSumBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdSumBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdSumBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdSumHashAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_HASH_ASC',
  ExtrinsicsBySignerIdSumHashDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_HASH_DESC',
  ExtrinsicsBySignerIdSumIdAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_ID_ASC',
  ExtrinsicsBySignerIdSumIdDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_ID_DESC',
  ExtrinsicsBySignerIdSumIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_INDEX_ASC',
  ExtrinsicsBySignerIdSumIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_INDEX_DESC',
  ExtrinsicsBySignerIdSumIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdSumIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdSumIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdSumIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdSumMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_METHOD_ASC',
  ExtrinsicsBySignerIdSumMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_METHOD_DESC',
  ExtrinsicsBySignerIdSumModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_MODULE_ASC',
  ExtrinsicsBySignerIdSumModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_MODULE_DESC',
  ExtrinsicsBySignerIdSumSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_SUM_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdSumSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_SUM_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdVariancePopulationArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdVariancePopulationArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdVariancePopulationBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdVariancePopulationBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdVariancePopulationBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdVariancePopulationBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdVariancePopulationHashAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_HASH_ASC',
  ExtrinsicsBySignerIdVariancePopulationHashDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_HASH_DESC',
  ExtrinsicsBySignerIdVariancePopulationIdAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_ID_ASC',
  ExtrinsicsBySignerIdVariancePopulationIdDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_ID_DESC',
  ExtrinsicsBySignerIdVariancePopulationIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_INDEX_ASC',
  ExtrinsicsBySignerIdVariancePopulationIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_INDEX_DESC',
  ExtrinsicsBySignerIdVariancePopulationIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdVariancePopulationIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdVariancePopulationIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdVariancePopulationIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdVariancePopulationMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_METHOD_ASC',
  ExtrinsicsBySignerIdVariancePopulationMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_METHOD_DESC',
  ExtrinsicsBySignerIdVariancePopulationModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_MODULE_ASC',
  ExtrinsicsBySignerIdVariancePopulationModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_MODULE_DESC',
  ExtrinsicsBySignerIdVariancePopulationSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdVariancePopulationSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_POPULATION_SIGNER_ID_DESC',
  ExtrinsicsBySignerIdVarianceSampleArgumentsAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_ARGUMENTS_ASC',
  ExtrinsicsBySignerIdVarianceSampleArgumentsDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_ARGUMENTS_DESC',
  ExtrinsicsBySignerIdVarianceSampleBlockIdAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  ExtrinsicsBySignerIdVarianceSampleBlockIdDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  ExtrinsicsBySignerIdVarianceSampleBlockNumberAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  ExtrinsicsBySignerIdVarianceSampleBlockNumberDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  ExtrinsicsBySignerIdVarianceSampleHashAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_HASH_ASC',
  ExtrinsicsBySignerIdVarianceSampleHashDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_HASH_DESC',
  ExtrinsicsBySignerIdVarianceSampleIdAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_ID_ASC',
  ExtrinsicsBySignerIdVarianceSampleIdDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_ID_DESC',
  ExtrinsicsBySignerIdVarianceSampleIndexAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_INDEX_ASC',
  ExtrinsicsBySignerIdVarianceSampleIndexDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_INDEX_DESC',
  ExtrinsicsBySignerIdVarianceSampleIsSignedAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_IS_SIGNED_ASC',
  ExtrinsicsBySignerIdVarianceSampleIsSignedDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_IS_SIGNED_DESC',
  ExtrinsicsBySignerIdVarianceSampleIsSuccessAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_IS_SUCCESS_ASC',
  ExtrinsicsBySignerIdVarianceSampleIsSuccessDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_IS_SUCCESS_DESC',
  ExtrinsicsBySignerIdVarianceSampleMethodAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_METHOD_ASC',
  ExtrinsicsBySignerIdVarianceSampleMethodDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_METHOD_DESC',
  ExtrinsicsBySignerIdVarianceSampleModuleAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_MODULE_ASC',
  ExtrinsicsBySignerIdVarianceSampleModuleDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_MODULE_DESC',
  ExtrinsicsBySignerIdVarianceSampleSignerIdAsc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_SIGNER_ID_ASC',
  ExtrinsicsBySignerIdVarianceSampleSignerIdDesc = 'EXTRINSICS_BY_SIGNER_ID_VARIANCE_SAMPLE_SIGNER_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A connection to a list of `Authority` values. */
export type AuthoritiesConnection = {
  __typename?: 'AuthoritiesConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AuthorityAggregates>;
  /** A list of edges which contains the `Authority` and cursor to aid in pagination. */
  edges: Array<AuthoritiesEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AuthorityAggregates>>;
  /** A list of `Authority` objects. */
  nodes: Array<Maybe<Authority>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Authority` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Authority` values. */
export type AuthoritiesConnectionGroupedAggregatesArgs = {
  groupBy: Array<AuthoritiesGroupBy>;
  having?: InputMaybe<AuthoritiesHavingInput>;
};

/** A `Authority` edge in the connection. */
export type AuthoritiesEdge = {
  __typename?: 'AuthoritiesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Authority` at the end of the edge. */
  node?: Maybe<Authority>;
};

/** Grouping methods for `Authority` for usage during aggregation. */
export enum AuthoritiesGroupBy {
  BlockId = 'BLOCK_ID',
  Current = 'CURRENT',
  Next = 'NEXT',
}

/** Conditions for `Authority` aggregates. */
export type AuthoritiesHavingInput = {
  AND?: InputMaybe<Array<AuthoritiesHavingInput>>;
  OR?: InputMaybe<Array<AuthoritiesHavingInput>>;
};

/** Methods to use when ordering `Authority`. */
export enum AuthoritiesOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CurrentAsc = 'CURRENT_ASC',
  CurrentDesc = 'CURRENT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NextAsc = 'NEXT_ASC',
  NextDesc = 'NEXT_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

export type Authority = Node & {
  __typename?: 'Authority';
  /** Reads a single `Block` that is related to this `Authority`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  current?: Maybe<Scalars['JSON']>;
  id: Scalars['String'];
  next?: Maybe<Scalars['JSON']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
};

export type AuthorityAggregates = {
  __typename?: 'AuthorityAggregates';
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<AuthorityDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
};

export type AuthorityDistinctCountAggregates = {
  __typename?: 'AuthorityDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of current across the matching connection */
  current?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of next across the matching connection */
  next?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Authority` object types. All fields are combined with a logical ‘and.’ */
export type AuthorityFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<AuthorityFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `current` field. */
  current?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `next` field. */
  next?: InputMaybe<JsonFilter>;
  /** Negates the expression. */
  not?: InputMaybe<AuthorityFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<AuthorityFilter>>;
};

/** A filter to be used against BigFloat fields. All fields are combined with a logical ‘and.’ */
export type BigFloatFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['BigFloat']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['BigFloat']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['BigFloat']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigFloat']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['BigFloat']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['BigFloat']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['BigFloat']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['BigFloat']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['BigFloat']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['BigFloat']>>;
};

export type Block = Node & {
  __typename?: 'Block';
  /** Reads and enables pagination through a set of `Account`. */
  accountsByAccountCreateAtBlockIdAndCreatorId: BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Account`. */
  accountsByCreateAtBlockId: AccountsConnection;
  /** Reads and enables pagination through a set of `Account`. */
  accountsByExtrinsicBlockIdAndSignerId: BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Authority`. */
  authorities: AuthoritiesConnection;
  /** Reads and enables pagination through a set of `Event`. */
  events: EventsConnection;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsics: ExtrinsicsConnection;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsicsByEventBlockIdAndExtrinsicId: BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyConnection;
  extrinsicsRoot?: Maybe<Scalars['String']>;
  hash?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  /** Reads and enables pagination through a set of `KeygenThreshold`. */
  keygenThresholds: KeygenThresholdsConnection;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  number: Scalars['BigFloat'];
  parentHash?: Maybe<Scalars['String']>;
  /** Reads and enables pagination through a set of `Session`. */
  sessions: SessionsConnection;
  /** Reads and enables pagination through a set of `SignatureThreshold`. */
  signatureThresholds: SignatureThresholdsConnection;
  specVersion?: Maybe<Scalars['String']>;
  stateRoot?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Datetime']>;
};

export type BlockAccountsByAccountCreateAtBlockIdAndCreatorIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AccountFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountsOrderBy>>;
};

export type BlockAccountsByCreateAtBlockIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AccountFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountsOrderBy>>;
};

export type BlockAccountsByExtrinsicBlockIdAndSignerIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AccountFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountsOrderBy>>;
};

export type BlockAuthoritiesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AuthorityFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AuthoritiesOrderBy>>;
};

export type BlockEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<EventFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};

export type BlockExtrinsicsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ExtrinsicFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ExtrinsicsOrderBy>>;
};

export type BlockExtrinsicsByEventBlockIdAndExtrinsicIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ExtrinsicFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ExtrinsicsOrderBy>>;
};

export type BlockKeygenThresholdsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<KeygenThresholdFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<KeygenThresholdsOrderBy>>;
};

export type BlockSessionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionsOrderBy>>;
};

export type BlockSignatureThresholdsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SignatureThresholdFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SignatureThresholdsOrderBy>>;
};

/** A connection to a list of `Account` values, with data from `Account`. */
export type BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyConnection = {
  __typename?: 'BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AccountAggregates>;
  /** A list of edges which contains the `Account`, info from the `Account`, and the cursor to aid in pagination. */
  edges: Array<BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AccountAggregates>>;
  /** A list of `Account` objects. */
  nodes: Array<Maybe<Account>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Account` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Account` values, with data from `Account`. */
export type BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<AccountsGroupBy>;
  having?: InputMaybe<AccountsHavingInput>;
};

/** A `Account` edge in the connection, with data from `Account`. */
export type BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyEdge = {
  __typename?: 'BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyEdge';
  /** Reads and enables pagination through a set of `Account`. */
  accountsByCreatorId: AccountsConnection;
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Account` at the end of the edge. */
  node?: Maybe<Account>;
};

/** A `Account` edge in the connection, with data from `Account`. */
export type BlockAccountsByAccountCreateAtBlockIdAndCreatorIdManyToManyEdgeAccountsByCreatorIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AccountFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountsOrderBy>>;
};

/** A connection to a list of `Account` values, with data from `Extrinsic`. */
export type BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyConnection = {
  __typename?: 'BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<AccountAggregates>;
  /** A list of edges which contains the `Account`, info from the `Extrinsic`, and the cursor to aid in pagination. */
  edges: Array<BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<AccountAggregates>>;
  /** A list of `Account` objects. */
  nodes: Array<Maybe<Account>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Account` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Account` values, with data from `Extrinsic`. */
export type BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<AccountsGroupBy>;
  having?: InputMaybe<AccountsHavingInput>;
};

/** A `Account` edge in the connection, with data from `Extrinsic`. */
export type BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyEdge = {
  __typename?: 'BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsicsBySignerId: ExtrinsicsConnection;
  /** The `Account` at the end of the edge. */
  node?: Maybe<Account>;
};

/** A `Account` edge in the connection, with data from `Extrinsic`. */
export type BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyEdgeExtrinsicsBySignerIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ExtrinsicFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ExtrinsicsOrderBy>>;
};

export type BlockAggregates = {
  __typename?: 'BlockAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<BlockAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<BlockDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<BlockMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<BlockMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<BlockStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<BlockStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<BlockSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<BlockVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<BlockVarianceSampleAggregates>;
};

export type BlockAverageAggregates = {
  __typename?: 'BlockAverageAggregates';
  /** Mean average of number across the matching connection */
  number?: Maybe<Scalars['BigFloat']>;
};

export type BlockDistinctCountAggregates = {
  __typename?: 'BlockDistinctCountAggregates';
  /** Distinct count of extrinsicsRoot across the matching connection */
  extrinsicsRoot?: Maybe<Scalars['BigInt']>;
  /** Distinct count of hash across the matching connection */
  hash?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of number across the matching connection */
  number?: Maybe<Scalars['BigInt']>;
  /** Distinct count of parentHash across the matching connection */
  parentHash?: Maybe<Scalars['BigInt']>;
  /** Distinct count of specVersion across the matching connection */
  specVersion?: Maybe<Scalars['BigInt']>;
  /** Distinct count of stateRoot across the matching connection */
  stateRoot?: Maybe<Scalars['BigInt']>;
  /** Distinct count of timestamp across the matching connection */
  timestamp?: Maybe<Scalars['BigInt']>;
};

/** A connection to a list of `Extrinsic` values, with data from `Event`. */
export type BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyConnection = {
  __typename?: 'BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ExtrinsicAggregates>;
  /** A list of edges which contains the `Extrinsic`, info from the `Event`, and the cursor to aid in pagination. */
  edges: Array<BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ExtrinsicAggregates>>;
  /** A list of `Extrinsic` objects. */
  nodes: Array<Maybe<Extrinsic>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Extrinsic` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Extrinsic` values, with data from `Event`. */
export type BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<ExtrinsicsGroupBy>;
  having?: InputMaybe<ExtrinsicsHavingInput>;
};

/** A `Extrinsic` edge in the connection, with data from `Event`. */
export type BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyEdge = {
  __typename?: 'BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** Reads and enables pagination through a set of `Event`. */
  events: EventsConnection;
  /** The `Extrinsic` at the end of the edge. */
  node?: Maybe<Extrinsic>;
};

/** A `Extrinsic` edge in the connection, with data from `Event`. */
export type BlockExtrinsicsByEventBlockIdAndExtrinsicIdManyToManyEdgeEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<EventFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};

/** A filter to be used against `Block` object types. All fields are combined with a logical ‘and.’ */
export type BlockFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<BlockFilter>>;
  /** Filter by the object’s `extrinsicsRoot` field. */
  extrinsicsRoot?: InputMaybe<StringFilter>;
  /** Filter by the object’s `hash` field. */
  hash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<BlockFilter>;
  /** Filter by the object’s `number` field. */
  number?: InputMaybe<BigFloatFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<BlockFilter>>;
  /** Filter by the object’s `parentHash` field. */
  parentHash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `specVersion` field. */
  specVersion?: InputMaybe<StringFilter>;
  /** Filter by the object’s `stateRoot` field. */
  stateRoot?: InputMaybe<StringFilter>;
  /** Filter by the object’s `timestamp` field. */
  timestamp?: InputMaybe<DatetimeFilter>;
};

export type BlockMaxAggregates = {
  __typename?: 'BlockMaxAggregates';
  /** Maximum of number across the matching connection */
  number?: Maybe<Scalars['BigFloat']>;
};

export type BlockMinAggregates = {
  __typename?: 'BlockMinAggregates';
  /** Minimum of number across the matching connection */
  number?: Maybe<Scalars['BigFloat']>;
};

export type BlockStddevPopulationAggregates = {
  __typename?: 'BlockStddevPopulationAggregates';
  /** Population standard deviation of number across the matching connection */
  number?: Maybe<Scalars['BigFloat']>;
};

export type BlockStddevSampleAggregates = {
  __typename?: 'BlockStddevSampleAggregates';
  /** Sample standard deviation of number across the matching connection */
  number?: Maybe<Scalars['BigFloat']>;
};

export type BlockSumAggregates = {
  __typename?: 'BlockSumAggregates';
  /** Sum of number across the matching connection */
  number: Scalars['BigFloat'];
};

export type BlockVariancePopulationAggregates = {
  __typename?: 'BlockVariancePopulationAggregates';
  /** Population variance of number across the matching connection */
  number?: Maybe<Scalars['BigFloat']>;
};

export type BlockVarianceSampleAggregates = {
  __typename?: 'BlockVarianceSampleAggregates';
  /** Sample variance of number across the matching connection */
  number?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `Block` values. */
export type BlocksConnection = {
  __typename?: 'BlocksConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** A list of edges which contains the `Block` and cursor to aid in pagination. */
  edges: Array<BlocksEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Block` values. */
export type BlocksConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: InputMaybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection. */
export type BlocksEdge = {
  __typename?: 'BlocksEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
};

/** Grouping methods for `Block` for usage during aggregation. */
export enum BlocksGroupBy {
  ExtrinsicsRoot = 'EXTRINSICS_ROOT',
  Hash = 'HASH',
  ParentHash = 'PARENT_HASH',
  SpecVersion = 'SPEC_VERSION',
  StateRoot = 'STATE_ROOT',
  Timestamp = 'TIMESTAMP',
  TimestampTruncatedToDay = 'TIMESTAMP_TRUNCATED_TO_DAY',
  TimestampTruncatedToHour = 'TIMESTAMP_TRUNCATED_TO_HOUR',
}

export type BlocksHavingAverageInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type BlocksHavingDistinctCountInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

/** Conditions for `Block` aggregates. */
export type BlocksHavingInput = {
  AND?: InputMaybe<Array<BlocksHavingInput>>;
  OR?: InputMaybe<Array<BlocksHavingInput>>;
  average?: InputMaybe<BlocksHavingAverageInput>;
  distinctCount?: InputMaybe<BlocksHavingDistinctCountInput>;
  max?: InputMaybe<BlocksHavingMaxInput>;
  min?: InputMaybe<BlocksHavingMinInput>;
  stddevPopulation?: InputMaybe<BlocksHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<BlocksHavingStddevSampleInput>;
  sum?: InputMaybe<BlocksHavingSumInput>;
  variancePopulation?: InputMaybe<BlocksHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<BlocksHavingVarianceSampleInput>;
};

export type BlocksHavingMaxInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type BlocksHavingMinInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type BlocksHavingStddevPopulationInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type BlocksHavingStddevSampleInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type BlocksHavingSumInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type BlocksHavingVariancePopulationInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type BlocksHavingVarianceSampleInput = {
  number?: InputMaybe<HavingBigfloatFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

/** Methods to use when ordering `Block`. */
export enum BlocksOrderBy {
  AccountsByCreateAtBlockIdAverageCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdAverageCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdAverageCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdAverageCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdAverageCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdAverageCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdAverageIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_ID_ASC',
  AccountsByCreateAtBlockIdAverageIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_AVERAGE_ID_DESC',
  AccountsByCreateAtBlockIdCountAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_COUNT_ASC',
  AccountsByCreateAtBlockIdCountDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_COUNT_DESC',
  AccountsByCreateAtBlockIdDistinctCountCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdDistinctCountCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdDistinctCountCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdDistinctCountCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdDistinctCountCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdDistinctCountCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdDistinctCountIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_ID_ASC',
  AccountsByCreateAtBlockIdDistinctCountIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_DISTINCT_COUNT_ID_DESC',
  AccountsByCreateAtBlockIdMaxCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdMaxCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdMaxCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdMaxCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdMaxCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdMaxCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdMaxIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_ID_ASC',
  AccountsByCreateAtBlockIdMaxIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MAX_ID_DESC',
  AccountsByCreateAtBlockIdMinCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdMinCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdMinCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdMinCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdMinCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdMinCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdMinIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_ID_ASC',
  AccountsByCreateAtBlockIdMinIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_MIN_ID_DESC',
  AccountsByCreateAtBlockIdStddevPopulationCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdStddevPopulationCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdStddevPopulationCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdStddevPopulationCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdStddevPopulationCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdStddevPopulationCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdStddevPopulationIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_ID_ASC',
  AccountsByCreateAtBlockIdStddevPopulationIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_POPULATION_ID_DESC',
  AccountsByCreateAtBlockIdStddevSampleCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdStddevSampleCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdStddevSampleCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdStddevSampleCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdStddevSampleCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdStddevSampleCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdStddevSampleIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_ID_ASC',
  AccountsByCreateAtBlockIdStddevSampleIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_STDDEV_SAMPLE_ID_DESC',
  AccountsByCreateAtBlockIdSumCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdSumCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdSumCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdSumCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdSumCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdSumCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdSumIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_ID_ASC',
  AccountsByCreateAtBlockIdSumIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_SUM_ID_DESC',
  AccountsByCreateAtBlockIdVariancePopulationCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdVariancePopulationCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdVariancePopulationCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdVariancePopulationCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdVariancePopulationCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdVariancePopulationCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdVariancePopulationIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_ID_ASC',
  AccountsByCreateAtBlockIdVariancePopulationIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_POPULATION_ID_DESC',
  AccountsByCreateAtBlockIdVarianceSampleCreatedAtAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_CREATED_AT_ASC',
  AccountsByCreateAtBlockIdVarianceSampleCreatedAtDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_CREATED_AT_DESC',
  AccountsByCreateAtBlockIdVarianceSampleCreateAtBlockIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_CREATE_AT_BLOCK_ID_ASC',
  AccountsByCreateAtBlockIdVarianceSampleCreateAtBlockIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_CREATE_AT_BLOCK_ID_DESC',
  AccountsByCreateAtBlockIdVarianceSampleCreatorIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_CREATOR_ID_ASC',
  AccountsByCreateAtBlockIdVarianceSampleCreatorIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_CREATOR_ID_DESC',
  AccountsByCreateAtBlockIdVarianceSampleIdAsc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_ID_ASC',
  AccountsByCreateAtBlockIdVarianceSampleIdDesc = 'ACCOUNTS_BY_CREATE_AT_BLOCK_ID_VARIANCE_SAMPLE_ID_DESC',
  AuthoritiesAverageBlockIdAsc = 'AUTHORITIES_AVERAGE_BLOCK_ID_ASC',
  AuthoritiesAverageBlockIdDesc = 'AUTHORITIES_AVERAGE_BLOCK_ID_DESC',
  AuthoritiesAverageCurrentAsc = 'AUTHORITIES_AVERAGE_CURRENT_ASC',
  AuthoritiesAverageCurrentDesc = 'AUTHORITIES_AVERAGE_CURRENT_DESC',
  AuthoritiesAverageIdAsc = 'AUTHORITIES_AVERAGE_ID_ASC',
  AuthoritiesAverageIdDesc = 'AUTHORITIES_AVERAGE_ID_DESC',
  AuthoritiesAverageNextAsc = 'AUTHORITIES_AVERAGE_NEXT_ASC',
  AuthoritiesAverageNextDesc = 'AUTHORITIES_AVERAGE_NEXT_DESC',
  AuthoritiesCountAsc = 'AUTHORITIES_COUNT_ASC',
  AuthoritiesCountDesc = 'AUTHORITIES_COUNT_DESC',
  AuthoritiesDistinctCountBlockIdAsc = 'AUTHORITIES_DISTINCT_COUNT_BLOCK_ID_ASC',
  AuthoritiesDistinctCountBlockIdDesc = 'AUTHORITIES_DISTINCT_COUNT_BLOCK_ID_DESC',
  AuthoritiesDistinctCountCurrentAsc = 'AUTHORITIES_DISTINCT_COUNT_CURRENT_ASC',
  AuthoritiesDistinctCountCurrentDesc = 'AUTHORITIES_DISTINCT_COUNT_CURRENT_DESC',
  AuthoritiesDistinctCountIdAsc = 'AUTHORITIES_DISTINCT_COUNT_ID_ASC',
  AuthoritiesDistinctCountIdDesc = 'AUTHORITIES_DISTINCT_COUNT_ID_DESC',
  AuthoritiesDistinctCountNextAsc = 'AUTHORITIES_DISTINCT_COUNT_NEXT_ASC',
  AuthoritiesDistinctCountNextDesc = 'AUTHORITIES_DISTINCT_COUNT_NEXT_DESC',
  AuthoritiesMaxBlockIdAsc = 'AUTHORITIES_MAX_BLOCK_ID_ASC',
  AuthoritiesMaxBlockIdDesc = 'AUTHORITIES_MAX_BLOCK_ID_DESC',
  AuthoritiesMaxCurrentAsc = 'AUTHORITIES_MAX_CURRENT_ASC',
  AuthoritiesMaxCurrentDesc = 'AUTHORITIES_MAX_CURRENT_DESC',
  AuthoritiesMaxIdAsc = 'AUTHORITIES_MAX_ID_ASC',
  AuthoritiesMaxIdDesc = 'AUTHORITIES_MAX_ID_DESC',
  AuthoritiesMaxNextAsc = 'AUTHORITIES_MAX_NEXT_ASC',
  AuthoritiesMaxNextDesc = 'AUTHORITIES_MAX_NEXT_DESC',
  AuthoritiesMinBlockIdAsc = 'AUTHORITIES_MIN_BLOCK_ID_ASC',
  AuthoritiesMinBlockIdDesc = 'AUTHORITIES_MIN_BLOCK_ID_DESC',
  AuthoritiesMinCurrentAsc = 'AUTHORITIES_MIN_CURRENT_ASC',
  AuthoritiesMinCurrentDesc = 'AUTHORITIES_MIN_CURRENT_DESC',
  AuthoritiesMinIdAsc = 'AUTHORITIES_MIN_ID_ASC',
  AuthoritiesMinIdDesc = 'AUTHORITIES_MIN_ID_DESC',
  AuthoritiesMinNextAsc = 'AUTHORITIES_MIN_NEXT_ASC',
  AuthoritiesMinNextDesc = 'AUTHORITIES_MIN_NEXT_DESC',
  AuthoritiesStddevPopulationBlockIdAsc = 'AUTHORITIES_STDDEV_POPULATION_BLOCK_ID_ASC',
  AuthoritiesStddevPopulationBlockIdDesc = 'AUTHORITIES_STDDEV_POPULATION_BLOCK_ID_DESC',
  AuthoritiesStddevPopulationCurrentAsc = 'AUTHORITIES_STDDEV_POPULATION_CURRENT_ASC',
  AuthoritiesStddevPopulationCurrentDesc = 'AUTHORITIES_STDDEV_POPULATION_CURRENT_DESC',
  AuthoritiesStddevPopulationIdAsc = 'AUTHORITIES_STDDEV_POPULATION_ID_ASC',
  AuthoritiesStddevPopulationIdDesc = 'AUTHORITIES_STDDEV_POPULATION_ID_DESC',
  AuthoritiesStddevPopulationNextAsc = 'AUTHORITIES_STDDEV_POPULATION_NEXT_ASC',
  AuthoritiesStddevPopulationNextDesc = 'AUTHORITIES_STDDEV_POPULATION_NEXT_DESC',
  AuthoritiesStddevSampleBlockIdAsc = 'AUTHORITIES_STDDEV_SAMPLE_BLOCK_ID_ASC',
  AuthoritiesStddevSampleBlockIdDesc = 'AUTHORITIES_STDDEV_SAMPLE_BLOCK_ID_DESC',
  AuthoritiesStddevSampleCurrentAsc = 'AUTHORITIES_STDDEV_SAMPLE_CURRENT_ASC',
  AuthoritiesStddevSampleCurrentDesc = 'AUTHORITIES_STDDEV_SAMPLE_CURRENT_DESC',
  AuthoritiesStddevSampleIdAsc = 'AUTHORITIES_STDDEV_SAMPLE_ID_ASC',
  AuthoritiesStddevSampleIdDesc = 'AUTHORITIES_STDDEV_SAMPLE_ID_DESC',
  AuthoritiesStddevSampleNextAsc = 'AUTHORITIES_STDDEV_SAMPLE_NEXT_ASC',
  AuthoritiesStddevSampleNextDesc = 'AUTHORITIES_STDDEV_SAMPLE_NEXT_DESC',
  AuthoritiesSumBlockIdAsc = 'AUTHORITIES_SUM_BLOCK_ID_ASC',
  AuthoritiesSumBlockIdDesc = 'AUTHORITIES_SUM_BLOCK_ID_DESC',
  AuthoritiesSumCurrentAsc = 'AUTHORITIES_SUM_CURRENT_ASC',
  AuthoritiesSumCurrentDesc = 'AUTHORITIES_SUM_CURRENT_DESC',
  AuthoritiesSumIdAsc = 'AUTHORITIES_SUM_ID_ASC',
  AuthoritiesSumIdDesc = 'AUTHORITIES_SUM_ID_DESC',
  AuthoritiesSumNextAsc = 'AUTHORITIES_SUM_NEXT_ASC',
  AuthoritiesSumNextDesc = 'AUTHORITIES_SUM_NEXT_DESC',
  AuthoritiesVariancePopulationBlockIdAsc = 'AUTHORITIES_VARIANCE_POPULATION_BLOCK_ID_ASC',
  AuthoritiesVariancePopulationBlockIdDesc = 'AUTHORITIES_VARIANCE_POPULATION_BLOCK_ID_DESC',
  AuthoritiesVariancePopulationCurrentAsc = 'AUTHORITIES_VARIANCE_POPULATION_CURRENT_ASC',
  AuthoritiesVariancePopulationCurrentDesc = 'AUTHORITIES_VARIANCE_POPULATION_CURRENT_DESC',
  AuthoritiesVariancePopulationIdAsc = 'AUTHORITIES_VARIANCE_POPULATION_ID_ASC',
  AuthoritiesVariancePopulationIdDesc = 'AUTHORITIES_VARIANCE_POPULATION_ID_DESC',
  AuthoritiesVariancePopulationNextAsc = 'AUTHORITIES_VARIANCE_POPULATION_NEXT_ASC',
  AuthoritiesVariancePopulationNextDesc = 'AUTHORITIES_VARIANCE_POPULATION_NEXT_DESC',
  AuthoritiesVarianceSampleBlockIdAsc = 'AUTHORITIES_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  AuthoritiesVarianceSampleBlockIdDesc = 'AUTHORITIES_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  AuthoritiesVarianceSampleCurrentAsc = 'AUTHORITIES_VARIANCE_SAMPLE_CURRENT_ASC',
  AuthoritiesVarianceSampleCurrentDesc = 'AUTHORITIES_VARIANCE_SAMPLE_CURRENT_DESC',
  AuthoritiesVarianceSampleIdAsc = 'AUTHORITIES_VARIANCE_SAMPLE_ID_ASC',
  AuthoritiesVarianceSampleIdDesc = 'AUTHORITIES_VARIANCE_SAMPLE_ID_DESC',
  AuthoritiesVarianceSampleNextAsc = 'AUTHORITIES_VARIANCE_SAMPLE_NEXT_ASC',
  AuthoritiesVarianceSampleNextDesc = 'AUTHORITIES_VARIANCE_SAMPLE_NEXT_DESC',
  EventsAverageArgumentsAsc = 'EVENTS_AVERAGE_ARGUMENTS_ASC',
  EventsAverageArgumentsDesc = 'EVENTS_AVERAGE_ARGUMENTS_DESC',
  EventsAverageBlockIdAsc = 'EVENTS_AVERAGE_BLOCK_ID_ASC',
  EventsAverageBlockIdDesc = 'EVENTS_AVERAGE_BLOCK_ID_DESC',
  EventsAverageBlockNumberAsc = 'EVENTS_AVERAGE_BLOCK_NUMBER_ASC',
  EventsAverageBlockNumberDesc = 'EVENTS_AVERAGE_BLOCK_NUMBER_DESC',
  EventsAverageDataAsc = 'EVENTS_AVERAGE_DATA_ASC',
  EventsAverageDataDesc = 'EVENTS_AVERAGE_DATA_DESC',
  EventsAverageDocsAsc = 'EVENTS_AVERAGE_DOCS_ASC',
  EventsAverageDocsDesc = 'EVENTS_AVERAGE_DOCS_DESC',
  EventsAverageExtrinsicIdAsc = 'EVENTS_AVERAGE_EXTRINSIC_ID_ASC',
  EventsAverageExtrinsicIdDesc = 'EVENTS_AVERAGE_EXTRINSIC_ID_DESC',
  EventsAverageIdAsc = 'EVENTS_AVERAGE_ID_ASC',
  EventsAverageIdDesc = 'EVENTS_AVERAGE_ID_DESC',
  EventsAverageIndexAsc = 'EVENTS_AVERAGE_INDEX_ASC',
  EventsAverageIndexDesc = 'EVENTS_AVERAGE_INDEX_DESC',
  EventsAverageMethodAsc = 'EVENTS_AVERAGE_METHOD_ASC',
  EventsAverageMethodDesc = 'EVENTS_AVERAGE_METHOD_DESC',
  EventsAverageModuleAsc = 'EVENTS_AVERAGE_MODULE_ASC',
  EventsAverageModuleDesc = 'EVENTS_AVERAGE_MODULE_DESC',
  EventsAverageTimestampAsc = 'EVENTS_AVERAGE_TIMESTAMP_ASC',
  EventsAverageTimestampDesc = 'EVENTS_AVERAGE_TIMESTAMP_DESC',
  EventsCountAsc = 'EVENTS_COUNT_ASC',
  EventsCountDesc = 'EVENTS_COUNT_DESC',
  EventsDistinctCountArgumentsAsc = 'EVENTS_DISTINCT_COUNT_ARGUMENTS_ASC',
  EventsDistinctCountArgumentsDesc = 'EVENTS_DISTINCT_COUNT_ARGUMENTS_DESC',
  EventsDistinctCountBlockIdAsc = 'EVENTS_DISTINCT_COUNT_BLOCK_ID_ASC',
  EventsDistinctCountBlockIdDesc = 'EVENTS_DISTINCT_COUNT_BLOCK_ID_DESC',
  EventsDistinctCountBlockNumberAsc = 'EVENTS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  EventsDistinctCountBlockNumberDesc = 'EVENTS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  EventsDistinctCountDataAsc = 'EVENTS_DISTINCT_COUNT_DATA_ASC',
  EventsDistinctCountDataDesc = 'EVENTS_DISTINCT_COUNT_DATA_DESC',
  EventsDistinctCountDocsAsc = 'EVENTS_DISTINCT_COUNT_DOCS_ASC',
  EventsDistinctCountDocsDesc = 'EVENTS_DISTINCT_COUNT_DOCS_DESC',
  EventsDistinctCountExtrinsicIdAsc = 'EVENTS_DISTINCT_COUNT_EXTRINSIC_ID_ASC',
  EventsDistinctCountExtrinsicIdDesc = 'EVENTS_DISTINCT_COUNT_EXTRINSIC_ID_DESC',
  EventsDistinctCountIdAsc = 'EVENTS_DISTINCT_COUNT_ID_ASC',
  EventsDistinctCountIdDesc = 'EVENTS_DISTINCT_COUNT_ID_DESC',
  EventsDistinctCountIndexAsc = 'EVENTS_DISTINCT_COUNT_INDEX_ASC',
  EventsDistinctCountIndexDesc = 'EVENTS_DISTINCT_COUNT_INDEX_DESC',
  EventsDistinctCountMethodAsc = 'EVENTS_DISTINCT_COUNT_METHOD_ASC',
  EventsDistinctCountMethodDesc = 'EVENTS_DISTINCT_COUNT_METHOD_DESC',
  EventsDistinctCountModuleAsc = 'EVENTS_DISTINCT_COUNT_MODULE_ASC',
  EventsDistinctCountModuleDesc = 'EVENTS_DISTINCT_COUNT_MODULE_DESC',
  EventsDistinctCountTimestampAsc = 'EVENTS_DISTINCT_COUNT_TIMESTAMP_ASC',
  EventsDistinctCountTimestampDesc = 'EVENTS_DISTINCT_COUNT_TIMESTAMP_DESC',
  EventsMaxArgumentsAsc = 'EVENTS_MAX_ARGUMENTS_ASC',
  EventsMaxArgumentsDesc = 'EVENTS_MAX_ARGUMENTS_DESC',
  EventsMaxBlockIdAsc = 'EVENTS_MAX_BLOCK_ID_ASC',
  EventsMaxBlockIdDesc = 'EVENTS_MAX_BLOCK_ID_DESC',
  EventsMaxBlockNumberAsc = 'EVENTS_MAX_BLOCK_NUMBER_ASC',
  EventsMaxBlockNumberDesc = 'EVENTS_MAX_BLOCK_NUMBER_DESC',
  EventsMaxDataAsc = 'EVENTS_MAX_DATA_ASC',
  EventsMaxDataDesc = 'EVENTS_MAX_DATA_DESC',
  EventsMaxDocsAsc = 'EVENTS_MAX_DOCS_ASC',
  EventsMaxDocsDesc = 'EVENTS_MAX_DOCS_DESC',
  EventsMaxExtrinsicIdAsc = 'EVENTS_MAX_EXTRINSIC_ID_ASC',
  EventsMaxExtrinsicIdDesc = 'EVENTS_MAX_EXTRINSIC_ID_DESC',
  EventsMaxIdAsc = 'EVENTS_MAX_ID_ASC',
  EventsMaxIdDesc = 'EVENTS_MAX_ID_DESC',
  EventsMaxIndexAsc = 'EVENTS_MAX_INDEX_ASC',
  EventsMaxIndexDesc = 'EVENTS_MAX_INDEX_DESC',
  EventsMaxMethodAsc = 'EVENTS_MAX_METHOD_ASC',
  EventsMaxMethodDesc = 'EVENTS_MAX_METHOD_DESC',
  EventsMaxModuleAsc = 'EVENTS_MAX_MODULE_ASC',
  EventsMaxModuleDesc = 'EVENTS_MAX_MODULE_DESC',
  EventsMaxTimestampAsc = 'EVENTS_MAX_TIMESTAMP_ASC',
  EventsMaxTimestampDesc = 'EVENTS_MAX_TIMESTAMP_DESC',
  EventsMinArgumentsAsc = 'EVENTS_MIN_ARGUMENTS_ASC',
  EventsMinArgumentsDesc = 'EVENTS_MIN_ARGUMENTS_DESC',
  EventsMinBlockIdAsc = 'EVENTS_MIN_BLOCK_ID_ASC',
  EventsMinBlockIdDesc = 'EVENTS_MIN_BLOCK_ID_DESC',
  EventsMinBlockNumberAsc = 'EVENTS_MIN_BLOCK_NUMBER_ASC',
  EventsMinBlockNumberDesc = 'EVENTS_MIN_BLOCK_NUMBER_DESC',
  EventsMinDataAsc = 'EVENTS_MIN_DATA_ASC',
  EventsMinDataDesc = 'EVENTS_MIN_DATA_DESC',
  EventsMinDocsAsc = 'EVENTS_MIN_DOCS_ASC',
  EventsMinDocsDesc = 'EVENTS_MIN_DOCS_DESC',
  EventsMinExtrinsicIdAsc = 'EVENTS_MIN_EXTRINSIC_ID_ASC',
  EventsMinExtrinsicIdDesc = 'EVENTS_MIN_EXTRINSIC_ID_DESC',
  EventsMinIdAsc = 'EVENTS_MIN_ID_ASC',
  EventsMinIdDesc = 'EVENTS_MIN_ID_DESC',
  EventsMinIndexAsc = 'EVENTS_MIN_INDEX_ASC',
  EventsMinIndexDesc = 'EVENTS_MIN_INDEX_DESC',
  EventsMinMethodAsc = 'EVENTS_MIN_METHOD_ASC',
  EventsMinMethodDesc = 'EVENTS_MIN_METHOD_DESC',
  EventsMinModuleAsc = 'EVENTS_MIN_MODULE_ASC',
  EventsMinModuleDesc = 'EVENTS_MIN_MODULE_DESC',
  EventsMinTimestampAsc = 'EVENTS_MIN_TIMESTAMP_ASC',
  EventsMinTimestampDesc = 'EVENTS_MIN_TIMESTAMP_DESC',
  EventsStddevPopulationArgumentsAsc = 'EVENTS_STDDEV_POPULATION_ARGUMENTS_ASC',
  EventsStddevPopulationArgumentsDesc = 'EVENTS_STDDEV_POPULATION_ARGUMENTS_DESC',
  EventsStddevPopulationBlockIdAsc = 'EVENTS_STDDEV_POPULATION_BLOCK_ID_ASC',
  EventsStddevPopulationBlockIdDesc = 'EVENTS_STDDEV_POPULATION_BLOCK_ID_DESC',
  EventsStddevPopulationBlockNumberAsc = 'EVENTS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  EventsStddevPopulationBlockNumberDesc = 'EVENTS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  EventsStddevPopulationDataAsc = 'EVENTS_STDDEV_POPULATION_DATA_ASC',
  EventsStddevPopulationDataDesc = 'EVENTS_STDDEV_POPULATION_DATA_DESC',
  EventsStddevPopulationDocsAsc = 'EVENTS_STDDEV_POPULATION_DOCS_ASC',
  EventsStddevPopulationDocsDesc = 'EVENTS_STDDEV_POPULATION_DOCS_DESC',
  EventsStddevPopulationExtrinsicIdAsc = 'EVENTS_STDDEV_POPULATION_EXTRINSIC_ID_ASC',
  EventsStddevPopulationExtrinsicIdDesc = 'EVENTS_STDDEV_POPULATION_EXTRINSIC_ID_DESC',
  EventsStddevPopulationIdAsc = 'EVENTS_STDDEV_POPULATION_ID_ASC',
  EventsStddevPopulationIdDesc = 'EVENTS_STDDEV_POPULATION_ID_DESC',
  EventsStddevPopulationIndexAsc = 'EVENTS_STDDEV_POPULATION_INDEX_ASC',
  EventsStddevPopulationIndexDesc = 'EVENTS_STDDEV_POPULATION_INDEX_DESC',
  EventsStddevPopulationMethodAsc = 'EVENTS_STDDEV_POPULATION_METHOD_ASC',
  EventsStddevPopulationMethodDesc = 'EVENTS_STDDEV_POPULATION_METHOD_DESC',
  EventsStddevPopulationModuleAsc = 'EVENTS_STDDEV_POPULATION_MODULE_ASC',
  EventsStddevPopulationModuleDesc = 'EVENTS_STDDEV_POPULATION_MODULE_DESC',
  EventsStddevPopulationTimestampAsc = 'EVENTS_STDDEV_POPULATION_TIMESTAMP_ASC',
  EventsStddevPopulationTimestampDesc = 'EVENTS_STDDEV_POPULATION_TIMESTAMP_DESC',
  EventsStddevSampleArgumentsAsc = 'EVENTS_STDDEV_SAMPLE_ARGUMENTS_ASC',
  EventsStddevSampleArgumentsDesc = 'EVENTS_STDDEV_SAMPLE_ARGUMENTS_DESC',
  EventsStddevSampleBlockIdAsc = 'EVENTS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  EventsStddevSampleBlockIdDesc = 'EVENTS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  EventsStddevSampleBlockNumberAsc = 'EVENTS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  EventsStddevSampleBlockNumberDesc = 'EVENTS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  EventsStddevSampleDataAsc = 'EVENTS_STDDEV_SAMPLE_DATA_ASC',
  EventsStddevSampleDataDesc = 'EVENTS_STDDEV_SAMPLE_DATA_DESC',
  EventsStddevSampleDocsAsc = 'EVENTS_STDDEV_SAMPLE_DOCS_ASC',
  EventsStddevSampleDocsDesc = 'EVENTS_STDDEV_SAMPLE_DOCS_DESC',
  EventsStddevSampleExtrinsicIdAsc = 'EVENTS_STDDEV_SAMPLE_EXTRINSIC_ID_ASC',
  EventsStddevSampleExtrinsicIdDesc = 'EVENTS_STDDEV_SAMPLE_EXTRINSIC_ID_DESC',
  EventsStddevSampleIdAsc = 'EVENTS_STDDEV_SAMPLE_ID_ASC',
  EventsStddevSampleIdDesc = 'EVENTS_STDDEV_SAMPLE_ID_DESC',
  EventsStddevSampleIndexAsc = 'EVENTS_STDDEV_SAMPLE_INDEX_ASC',
  EventsStddevSampleIndexDesc = 'EVENTS_STDDEV_SAMPLE_INDEX_DESC',
  EventsStddevSampleMethodAsc = 'EVENTS_STDDEV_SAMPLE_METHOD_ASC',
  EventsStddevSampleMethodDesc = 'EVENTS_STDDEV_SAMPLE_METHOD_DESC',
  EventsStddevSampleModuleAsc = 'EVENTS_STDDEV_SAMPLE_MODULE_ASC',
  EventsStddevSampleModuleDesc = 'EVENTS_STDDEV_SAMPLE_MODULE_DESC',
  EventsStddevSampleTimestampAsc = 'EVENTS_STDDEV_SAMPLE_TIMESTAMP_ASC',
  EventsStddevSampleTimestampDesc = 'EVENTS_STDDEV_SAMPLE_TIMESTAMP_DESC',
  EventsSumArgumentsAsc = 'EVENTS_SUM_ARGUMENTS_ASC',
  EventsSumArgumentsDesc = 'EVENTS_SUM_ARGUMENTS_DESC',
  EventsSumBlockIdAsc = 'EVENTS_SUM_BLOCK_ID_ASC',
  EventsSumBlockIdDesc = 'EVENTS_SUM_BLOCK_ID_DESC',
  EventsSumBlockNumberAsc = 'EVENTS_SUM_BLOCK_NUMBER_ASC',
  EventsSumBlockNumberDesc = 'EVENTS_SUM_BLOCK_NUMBER_DESC',
  EventsSumDataAsc = 'EVENTS_SUM_DATA_ASC',
  EventsSumDataDesc = 'EVENTS_SUM_DATA_DESC',
  EventsSumDocsAsc = 'EVENTS_SUM_DOCS_ASC',
  EventsSumDocsDesc = 'EVENTS_SUM_DOCS_DESC',
  EventsSumExtrinsicIdAsc = 'EVENTS_SUM_EXTRINSIC_ID_ASC',
  EventsSumExtrinsicIdDesc = 'EVENTS_SUM_EXTRINSIC_ID_DESC',
  EventsSumIdAsc = 'EVENTS_SUM_ID_ASC',
  EventsSumIdDesc = 'EVENTS_SUM_ID_DESC',
  EventsSumIndexAsc = 'EVENTS_SUM_INDEX_ASC',
  EventsSumIndexDesc = 'EVENTS_SUM_INDEX_DESC',
  EventsSumMethodAsc = 'EVENTS_SUM_METHOD_ASC',
  EventsSumMethodDesc = 'EVENTS_SUM_METHOD_DESC',
  EventsSumModuleAsc = 'EVENTS_SUM_MODULE_ASC',
  EventsSumModuleDesc = 'EVENTS_SUM_MODULE_DESC',
  EventsSumTimestampAsc = 'EVENTS_SUM_TIMESTAMP_ASC',
  EventsSumTimestampDesc = 'EVENTS_SUM_TIMESTAMP_DESC',
  EventsVariancePopulationArgumentsAsc = 'EVENTS_VARIANCE_POPULATION_ARGUMENTS_ASC',
  EventsVariancePopulationArgumentsDesc = 'EVENTS_VARIANCE_POPULATION_ARGUMENTS_DESC',
  EventsVariancePopulationBlockIdAsc = 'EVENTS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  EventsVariancePopulationBlockIdDesc = 'EVENTS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  EventsVariancePopulationBlockNumberAsc = 'EVENTS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  EventsVariancePopulationBlockNumberDesc = 'EVENTS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  EventsVariancePopulationDataAsc = 'EVENTS_VARIANCE_POPULATION_DATA_ASC',
  EventsVariancePopulationDataDesc = 'EVENTS_VARIANCE_POPULATION_DATA_DESC',
  EventsVariancePopulationDocsAsc = 'EVENTS_VARIANCE_POPULATION_DOCS_ASC',
  EventsVariancePopulationDocsDesc = 'EVENTS_VARIANCE_POPULATION_DOCS_DESC',
  EventsVariancePopulationExtrinsicIdAsc = 'EVENTS_VARIANCE_POPULATION_EXTRINSIC_ID_ASC',
  EventsVariancePopulationExtrinsicIdDesc = 'EVENTS_VARIANCE_POPULATION_EXTRINSIC_ID_DESC',
  EventsVariancePopulationIdAsc = 'EVENTS_VARIANCE_POPULATION_ID_ASC',
  EventsVariancePopulationIdDesc = 'EVENTS_VARIANCE_POPULATION_ID_DESC',
  EventsVariancePopulationIndexAsc = 'EVENTS_VARIANCE_POPULATION_INDEX_ASC',
  EventsVariancePopulationIndexDesc = 'EVENTS_VARIANCE_POPULATION_INDEX_DESC',
  EventsVariancePopulationMethodAsc = 'EVENTS_VARIANCE_POPULATION_METHOD_ASC',
  EventsVariancePopulationMethodDesc = 'EVENTS_VARIANCE_POPULATION_METHOD_DESC',
  EventsVariancePopulationModuleAsc = 'EVENTS_VARIANCE_POPULATION_MODULE_ASC',
  EventsVariancePopulationModuleDesc = 'EVENTS_VARIANCE_POPULATION_MODULE_DESC',
  EventsVariancePopulationTimestampAsc = 'EVENTS_VARIANCE_POPULATION_TIMESTAMP_ASC',
  EventsVariancePopulationTimestampDesc = 'EVENTS_VARIANCE_POPULATION_TIMESTAMP_DESC',
  EventsVarianceSampleArgumentsAsc = 'EVENTS_VARIANCE_SAMPLE_ARGUMENTS_ASC',
  EventsVarianceSampleArgumentsDesc = 'EVENTS_VARIANCE_SAMPLE_ARGUMENTS_DESC',
  EventsVarianceSampleBlockIdAsc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  EventsVarianceSampleBlockIdDesc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  EventsVarianceSampleBlockNumberAsc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  EventsVarianceSampleBlockNumberDesc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  EventsVarianceSampleDataAsc = 'EVENTS_VARIANCE_SAMPLE_DATA_ASC',
  EventsVarianceSampleDataDesc = 'EVENTS_VARIANCE_SAMPLE_DATA_DESC',
  EventsVarianceSampleDocsAsc = 'EVENTS_VARIANCE_SAMPLE_DOCS_ASC',
  EventsVarianceSampleDocsDesc = 'EVENTS_VARIANCE_SAMPLE_DOCS_DESC',
  EventsVarianceSampleExtrinsicIdAsc = 'EVENTS_VARIANCE_SAMPLE_EXTRINSIC_ID_ASC',
  EventsVarianceSampleExtrinsicIdDesc = 'EVENTS_VARIANCE_SAMPLE_EXTRINSIC_ID_DESC',
  EventsVarianceSampleIdAsc = 'EVENTS_VARIANCE_SAMPLE_ID_ASC',
  EventsVarianceSampleIdDesc = 'EVENTS_VARIANCE_SAMPLE_ID_DESC',
  EventsVarianceSampleIndexAsc = 'EVENTS_VARIANCE_SAMPLE_INDEX_ASC',
  EventsVarianceSampleIndexDesc = 'EVENTS_VARIANCE_SAMPLE_INDEX_DESC',
  EventsVarianceSampleMethodAsc = 'EVENTS_VARIANCE_SAMPLE_METHOD_ASC',
  EventsVarianceSampleMethodDesc = 'EVENTS_VARIANCE_SAMPLE_METHOD_DESC',
  EventsVarianceSampleModuleAsc = 'EVENTS_VARIANCE_SAMPLE_MODULE_ASC',
  EventsVarianceSampleModuleDesc = 'EVENTS_VARIANCE_SAMPLE_MODULE_DESC',
  EventsVarianceSampleTimestampAsc = 'EVENTS_VARIANCE_SAMPLE_TIMESTAMP_ASC',
  EventsVarianceSampleTimestampDesc = 'EVENTS_VARIANCE_SAMPLE_TIMESTAMP_DESC',
  ExtrinsicsAverageArgumentsAsc = 'EXTRINSICS_AVERAGE_ARGUMENTS_ASC',
  ExtrinsicsAverageArgumentsDesc = 'EXTRINSICS_AVERAGE_ARGUMENTS_DESC',
  ExtrinsicsAverageBlockIdAsc = 'EXTRINSICS_AVERAGE_BLOCK_ID_ASC',
  ExtrinsicsAverageBlockIdDesc = 'EXTRINSICS_AVERAGE_BLOCK_ID_DESC',
  ExtrinsicsAverageBlockNumberAsc = 'EXTRINSICS_AVERAGE_BLOCK_NUMBER_ASC',
  ExtrinsicsAverageBlockNumberDesc = 'EXTRINSICS_AVERAGE_BLOCK_NUMBER_DESC',
  ExtrinsicsAverageHashAsc = 'EXTRINSICS_AVERAGE_HASH_ASC',
  ExtrinsicsAverageHashDesc = 'EXTRINSICS_AVERAGE_HASH_DESC',
  ExtrinsicsAverageIdAsc = 'EXTRINSICS_AVERAGE_ID_ASC',
  ExtrinsicsAverageIdDesc = 'EXTRINSICS_AVERAGE_ID_DESC',
  ExtrinsicsAverageIndexAsc = 'EXTRINSICS_AVERAGE_INDEX_ASC',
  ExtrinsicsAverageIndexDesc = 'EXTRINSICS_AVERAGE_INDEX_DESC',
  ExtrinsicsAverageIsSignedAsc = 'EXTRINSICS_AVERAGE_IS_SIGNED_ASC',
  ExtrinsicsAverageIsSignedDesc = 'EXTRINSICS_AVERAGE_IS_SIGNED_DESC',
  ExtrinsicsAverageIsSuccessAsc = 'EXTRINSICS_AVERAGE_IS_SUCCESS_ASC',
  ExtrinsicsAverageIsSuccessDesc = 'EXTRINSICS_AVERAGE_IS_SUCCESS_DESC',
  ExtrinsicsAverageMethodAsc = 'EXTRINSICS_AVERAGE_METHOD_ASC',
  ExtrinsicsAverageMethodDesc = 'EXTRINSICS_AVERAGE_METHOD_DESC',
  ExtrinsicsAverageModuleAsc = 'EXTRINSICS_AVERAGE_MODULE_ASC',
  ExtrinsicsAverageModuleDesc = 'EXTRINSICS_AVERAGE_MODULE_DESC',
  ExtrinsicsAverageSignerIdAsc = 'EXTRINSICS_AVERAGE_SIGNER_ID_ASC',
  ExtrinsicsAverageSignerIdDesc = 'EXTRINSICS_AVERAGE_SIGNER_ID_DESC',
  ExtrinsicsCountAsc = 'EXTRINSICS_COUNT_ASC',
  ExtrinsicsCountDesc = 'EXTRINSICS_COUNT_DESC',
  ExtrinsicsDistinctCountArgumentsAsc = 'EXTRINSICS_DISTINCT_COUNT_ARGUMENTS_ASC',
  ExtrinsicsDistinctCountArgumentsDesc = 'EXTRINSICS_DISTINCT_COUNT_ARGUMENTS_DESC',
  ExtrinsicsDistinctCountBlockIdAsc = 'EXTRINSICS_DISTINCT_COUNT_BLOCK_ID_ASC',
  ExtrinsicsDistinctCountBlockIdDesc = 'EXTRINSICS_DISTINCT_COUNT_BLOCK_ID_DESC',
  ExtrinsicsDistinctCountBlockNumberAsc = 'EXTRINSICS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  ExtrinsicsDistinctCountBlockNumberDesc = 'EXTRINSICS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  ExtrinsicsDistinctCountHashAsc = 'EXTRINSICS_DISTINCT_COUNT_HASH_ASC',
  ExtrinsicsDistinctCountHashDesc = 'EXTRINSICS_DISTINCT_COUNT_HASH_DESC',
  ExtrinsicsDistinctCountIdAsc = 'EXTRINSICS_DISTINCT_COUNT_ID_ASC',
  ExtrinsicsDistinctCountIdDesc = 'EXTRINSICS_DISTINCT_COUNT_ID_DESC',
  ExtrinsicsDistinctCountIndexAsc = 'EXTRINSICS_DISTINCT_COUNT_INDEX_ASC',
  ExtrinsicsDistinctCountIndexDesc = 'EXTRINSICS_DISTINCT_COUNT_INDEX_DESC',
  ExtrinsicsDistinctCountIsSignedAsc = 'EXTRINSICS_DISTINCT_COUNT_IS_SIGNED_ASC',
  ExtrinsicsDistinctCountIsSignedDesc = 'EXTRINSICS_DISTINCT_COUNT_IS_SIGNED_DESC',
  ExtrinsicsDistinctCountIsSuccessAsc = 'EXTRINSICS_DISTINCT_COUNT_IS_SUCCESS_ASC',
  ExtrinsicsDistinctCountIsSuccessDesc = 'EXTRINSICS_DISTINCT_COUNT_IS_SUCCESS_DESC',
  ExtrinsicsDistinctCountMethodAsc = 'EXTRINSICS_DISTINCT_COUNT_METHOD_ASC',
  ExtrinsicsDistinctCountMethodDesc = 'EXTRINSICS_DISTINCT_COUNT_METHOD_DESC',
  ExtrinsicsDistinctCountModuleAsc = 'EXTRINSICS_DISTINCT_COUNT_MODULE_ASC',
  ExtrinsicsDistinctCountModuleDesc = 'EXTRINSICS_DISTINCT_COUNT_MODULE_DESC',
  ExtrinsicsDistinctCountSignerIdAsc = 'EXTRINSICS_DISTINCT_COUNT_SIGNER_ID_ASC',
  ExtrinsicsDistinctCountSignerIdDesc = 'EXTRINSICS_DISTINCT_COUNT_SIGNER_ID_DESC',
  ExtrinsicsMaxArgumentsAsc = 'EXTRINSICS_MAX_ARGUMENTS_ASC',
  ExtrinsicsMaxArgumentsDesc = 'EXTRINSICS_MAX_ARGUMENTS_DESC',
  ExtrinsicsMaxBlockIdAsc = 'EXTRINSICS_MAX_BLOCK_ID_ASC',
  ExtrinsicsMaxBlockIdDesc = 'EXTRINSICS_MAX_BLOCK_ID_DESC',
  ExtrinsicsMaxBlockNumberAsc = 'EXTRINSICS_MAX_BLOCK_NUMBER_ASC',
  ExtrinsicsMaxBlockNumberDesc = 'EXTRINSICS_MAX_BLOCK_NUMBER_DESC',
  ExtrinsicsMaxHashAsc = 'EXTRINSICS_MAX_HASH_ASC',
  ExtrinsicsMaxHashDesc = 'EXTRINSICS_MAX_HASH_DESC',
  ExtrinsicsMaxIdAsc = 'EXTRINSICS_MAX_ID_ASC',
  ExtrinsicsMaxIdDesc = 'EXTRINSICS_MAX_ID_DESC',
  ExtrinsicsMaxIndexAsc = 'EXTRINSICS_MAX_INDEX_ASC',
  ExtrinsicsMaxIndexDesc = 'EXTRINSICS_MAX_INDEX_DESC',
  ExtrinsicsMaxIsSignedAsc = 'EXTRINSICS_MAX_IS_SIGNED_ASC',
  ExtrinsicsMaxIsSignedDesc = 'EXTRINSICS_MAX_IS_SIGNED_DESC',
  ExtrinsicsMaxIsSuccessAsc = 'EXTRINSICS_MAX_IS_SUCCESS_ASC',
  ExtrinsicsMaxIsSuccessDesc = 'EXTRINSICS_MAX_IS_SUCCESS_DESC',
  ExtrinsicsMaxMethodAsc = 'EXTRINSICS_MAX_METHOD_ASC',
  ExtrinsicsMaxMethodDesc = 'EXTRINSICS_MAX_METHOD_DESC',
  ExtrinsicsMaxModuleAsc = 'EXTRINSICS_MAX_MODULE_ASC',
  ExtrinsicsMaxModuleDesc = 'EXTRINSICS_MAX_MODULE_DESC',
  ExtrinsicsMaxSignerIdAsc = 'EXTRINSICS_MAX_SIGNER_ID_ASC',
  ExtrinsicsMaxSignerIdDesc = 'EXTRINSICS_MAX_SIGNER_ID_DESC',
  ExtrinsicsMinArgumentsAsc = 'EXTRINSICS_MIN_ARGUMENTS_ASC',
  ExtrinsicsMinArgumentsDesc = 'EXTRINSICS_MIN_ARGUMENTS_DESC',
  ExtrinsicsMinBlockIdAsc = 'EXTRINSICS_MIN_BLOCK_ID_ASC',
  ExtrinsicsMinBlockIdDesc = 'EXTRINSICS_MIN_BLOCK_ID_DESC',
  ExtrinsicsMinBlockNumberAsc = 'EXTRINSICS_MIN_BLOCK_NUMBER_ASC',
  ExtrinsicsMinBlockNumberDesc = 'EXTRINSICS_MIN_BLOCK_NUMBER_DESC',
  ExtrinsicsMinHashAsc = 'EXTRINSICS_MIN_HASH_ASC',
  ExtrinsicsMinHashDesc = 'EXTRINSICS_MIN_HASH_DESC',
  ExtrinsicsMinIdAsc = 'EXTRINSICS_MIN_ID_ASC',
  ExtrinsicsMinIdDesc = 'EXTRINSICS_MIN_ID_DESC',
  ExtrinsicsMinIndexAsc = 'EXTRINSICS_MIN_INDEX_ASC',
  ExtrinsicsMinIndexDesc = 'EXTRINSICS_MIN_INDEX_DESC',
  ExtrinsicsMinIsSignedAsc = 'EXTRINSICS_MIN_IS_SIGNED_ASC',
  ExtrinsicsMinIsSignedDesc = 'EXTRINSICS_MIN_IS_SIGNED_DESC',
  ExtrinsicsMinIsSuccessAsc = 'EXTRINSICS_MIN_IS_SUCCESS_ASC',
  ExtrinsicsMinIsSuccessDesc = 'EXTRINSICS_MIN_IS_SUCCESS_DESC',
  ExtrinsicsMinMethodAsc = 'EXTRINSICS_MIN_METHOD_ASC',
  ExtrinsicsMinMethodDesc = 'EXTRINSICS_MIN_METHOD_DESC',
  ExtrinsicsMinModuleAsc = 'EXTRINSICS_MIN_MODULE_ASC',
  ExtrinsicsMinModuleDesc = 'EXTRINSICS_MIN_MODULE_DESC',
  ExtrinsicsMinSignerIdAsc = 'EXTRINSICS_MIN_SIGNER_ID_ASC',
  ExtrinsicsMinSignerIdDesc = 'EXTRINSICS_MIN_SIGNER_ID_DESC',
  ExtrinsicsRootAsc = 'EXTRINSICS_ROOT_ASC',
  ExtrinsicsRootDesc = 'EXTRINSICS_ROOT_DESC',
  ExtrinsicsStddevPopulationArgumentsAsc = 'EXTRINSICS_STDDEV_POPULATION_ARGUMENTS_ASC',
  ExtrinsicsStddevPopulationArgumentsDesc = 'EXTRINSICS_STDDEV_POPULATION_ARGUMENTS_DESC',
  ExtrinsicsStddevPopulationBlockIdAsc = 'EXTRINSICS_STDDEV_POPULATION_BLOCK_ID_ASC',
  ExtrinsicsStddevPopulationBlockIdDesc = 'EXTRINSICS_STDDEV_POPULATION_BLOCK_ID_DESC',
  ExtrinsicsStddevPopulationBlockNumberAsc = 'EXTRINSICS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  ExtrinsicsStddevPopulationBlockNumberDesc = 'EXTRINSICS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  ExtrinsicsStddevPopulationHashAsc = 'EXTRINSICS_STDDEV_POPULATION_HASH_ASC',
  ExtrinsicsStddevPopulationHashDesc = 'EXTRINSICS_STDDEV_POPULATION_HASH_DESC',
  ExtrinsicsStddevPopulationIdAsc = 'EXTRINSICS_STDDEV_POPULATION_ID_ASC',
  ExtrinsicsStddevPopulationIdDesc = 'EXTRINSICS_STDDEV_POPULATION_ID_DESC',
  ExtrinsicsStddevPopulationIndexAsc = 'EXTRINSICS_STDDEV_POPULATION_INDEX_ASC',
  ExtrinsicsStddevPopulationIndexDesc = 'EXTRINSICS_STDDEV_POPULATION_INDEX_DESC',
  ExtrinsicsStddevPopulationIsSignedAsc = 'EXTRINSICS_STDDEV_POPULATION_IS_SIGNED_ASC',
  ExtrinsicsStddevPopulationIsSignedDesc = 'EXTRINSICS_STDDEV_POPULATION_IS_SIGNED_DESC',
  ExtrinsicsStddevPopulationIsSuccessAsc = 'EXTRINSICS_STDDEV_POPULATION_IS_SUCCESS_ASC',
  ExtrinsicsStddevPopulationIsSuccessDesc = 'EXTRINSICS_STDDEV_POPULATION_IS_SUCCESS_DESC',
  ExtrinsicsStddevPopulationMethodAsc = 'EXTRINSICS_STDDEV_POPULATION_METHOD_ASC',
  ExtrinsicsStddevPopulationMethodDesc = 'EXTRINSICS_STDDEV_POPULATION_METHOD_DESC',
  ExtrinsicsStddevPopulationModuleAsc = 'EXTRINSICS_STDDEV_POPULATION_MODULE_ASC',
  ExtrinsicsStddevPopulationModuleDesc = 'EXTRINSICS_STDDEV_POPULATION_MODULE_DESC',
  ExtrinsicsStddevPopulationSignerIdAsc = 'EXTRINSICS_STDDEV_POPULATION_SIGNER_ID_ASC',
  ExtrinsicsStddevPopulationSignerIdDesc = 'EXTRINSICS_STDDEV_POPULATION_SIGNER_ID_DESC',
  ExtrinsicsStddevSampleArgumentsAsc = 'EXTRINSICS_STDDEV_SAMPLE_ARGUMENTS_ASC',
  ExtrinsicsStddevSampleArgumentsDesc = 'EXTRINSICS_STDDEV_SAMPLE_ARGUMENTS_DESC',
  ExtrinsicsStddevSampleBlockIdAsc = 'EXTRINSICS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  ExtrinsicsStddevSampleBlockIdDesc = 'EXTRINSICS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  ExtrinsicsStddevSampleBlockNumberAsc = 'EXTRINSICS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  ExtrinsicsStddevSampleBlockNumberDesc = 'EXTRINSICS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  ExtrinsicsStddevSampleHashAsc = 'EXTRINSICS_STDDEV_SAMPLE_HASH_ASC',
  ExtrinsicsStddevSampleHashDesc = 'EXTRINSICS_STDDEV_SAMPLE_HASH_DESC',
  ExtrinsicsStddevSampleIdAsc = 'EXTRINSICS_STDDEV_SAMPLE_ID_ASC',
  ExtrinsicsStddevSampleIdDesc = 'EXTRINSICS_STDDEV_SAMPLE_ID_DESC',
  ExtrinsicsStddevSampleIndexAsc = 'EXTRINSICS_STDDEV_SAMPLE_INDEX_ASC',
  ExtrinsicsStddevSampleIndexDesc = 'EXTRINSICS_STDDEV_SAMPLE_INDEX_DESC',
  ExtrinsicsStddevSampleIsSignedAsc = 'EXTRINSICS_STDDEV_SAMPLE_IS_SIGNED_ASC',
  ExtrinsicsStddevSampleIsSignedDesc = 'EXTRINSICS_STDDEV_SAMPLE_IS_SIGNED_DESC',
  ExtrinsicsStddevSampleIsSuccessAsc = 'EXTRINSICS_STDDEV_SAMPLE_IS_SUCCESS_ASC',
  ExtrinsicsStddevSampleIsSuccessDesc = 'EXTRINSICS_STDDEV_SAMPLE_IS_SUCCESS_DESC',
  ExtrinsicsStddevSampleMethodAsc = 'EXTRINSICS_STDDEV_SAMPLE_METHOD_ASC',
  ExtrinsicsStddevSampleMethodDesc = 'EXTRINSICS_STDDEV_SAMPLE_METHOD_DESC',
  ExtrinsicsStddevSampleModuleAsc = 'EXTRINSICS_STDDEV_SAMPLE_MODULE_ASC',
  ExtrinsicsStddevSampleModuleDesc = 'EXTRINSICS_STDDEV_SAMPLE_MODULE_DESC',
  ExtrinsicsStddevSampleSignerIdAsc = 'EXTRINSICS_STDDEV_SAMPLE_SIGNER_ID_ASC',
  ExtrinsicsStddevSampleSignerIdDesc = 'EXTRINSICS_STDDEV_SAMPLE_SIGNER_ID_DESC',
  ExtrinsicsSumArgumentsAsc = 'EXTRINSICS_SUM_ARGUMENTS_ASC',
  ExtrinsicsSumArgumentsDesc = 'EXTRINSICS_SUM_ARGUMENTS_DESC',
  ExtrinsicsSumBlockIdAsc = 'EXTRINSICS_SUM_BLOCK_ID_ASC',
  ExtrinsicsSumBlockIdDesc = 'EXTRINSICS_SUM_BLOCK_ID_DESC',
  ExtrinsicsSumBlockNumberAsc = 'EXTRINSICS_SUM_BLOCK_NUMBER_ASC',
  ExtrinsicsSumBlockNumberDesc = 'EXTRINSICS_SUM_BLOCK_NUMBER_DESC',
  ExtrinsicsSumHashAsc = 'EXTRINSICS_SUM_HASH_ASC',
  ExtrinsicsSumHashDesc = 'EXTRINSICS_SUM_HASH_DESC',
  ExtrinsicsSumIdAsc = 'EXTRINSICS_SUM_ID_ASC',
  ExtrinsicsSumIdDesc = 'EXTRINSICS_SUM_ID_DESC',
  ExtrinsicsSumIndexAsc = 'EXTRINSICS_SUM_INDEX_ASC',
  ExtrinsicsSumIndexDesc = 'EXTRINSICS_SUM_INDEX_DESC',
  ExtrinsicsSumIsSignedAsc = 'EXTRINSICS_SUM_IS_SIGNED_ASC',
  ExtrinsicsSumIsSignedDesc = 'EXTRINSICS_SUM_IS_SIGNED_DESC',
  ExtrinsicsSumIsSuccessAsc = 'EXTRINSICS_SUM_IS_SUCCESS_ASC',
  ExtrinsicsSumIsSuccessDesc = 'EXTRINSICS_SUM_IS_SUCCESS_DESC',
  ExtrinsicsSumMethodAsc = 'EXTRINSICS_SUM_METHOD_ASC',
  ExtrinsicsSumMethodDesc = 'EXTRINSICS_SUM_METHOD_DESC',
  ExtrinsicsSumModuleAsc = 'EXTRINSICS_SUM_MODULE_ASC',
  ExtrinsicsSumModuleDesc = 'EXTRINSICS_SUM_MODULE_DESC',
  ExtrinsicsSumSignerIdAsc = 'EXTRINSICS_SUM_SIGNER_ID_ASC',
  ExtrinsicsSumSignerIdDesc = 'EXTRINSICS_SUM_SIGNER_ID_DESC',
  ExtrinsicsVariancePopulationArgumentsAsc = 'EXTRINSICS_VARIANCE_POPULATION_ARGUMENTS_ASC',
  ExtrinsicsVariancePopulationArgumentsDesc = 'EXTRINSICS_VARIANCE_POPULATION_ARGUMENTS_DESC',
  ExtrinsicsVariancePopulationBlockIdAsc = 'EXTRINSICS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  ExtrinsicsVariancePopulationBlockIdDesc = 'EXTRINSICS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  ExtrinsicsVariancePopulationBlockNumberAsc = 'EXTRINSICS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  ExtrinsicsVariancePopulationBlockNumberDesc = 'EXTRINSICS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  ExtrinsicsVariancePopulationHashAsc = 'EXTRINSICS_VARIANCE_POPULATION_HASH_ASC',
  ExtrinsicsVariancePopulationHashDesc = 'EXTRINSICS_VARIANCE_POPULATION_HASH_DESC',
  ExtrinsicsVariancePopulationIdAsc = 'EXTRINSICS_VARIANCE_POPULATION_ID_ASC',
  ExtrinsicsVariancePopulationIdDesc = 'EXTRINSICS_VARIANCE_POPULATION_ID_DESC',
  ExtrinsicsVariancePopulationIndexAsc = 'EXTRINSICS_VARIANCE_POPULATION_INDEX_ASC',
  ExtrinsicsVariancePopulationIndexDesc = 'EXTRINSICS_VARIANCE_POPULATION_INDEX_DESC',
  ExtrinsicsVariancePopulationIsSignedAsc = 'EXTRINSICS_VARIANCE_POPULATION_IS_SIGNED_ASC',
  ExtrinsicsVariancePopulationIsSignedDesc = 'EXTRINSICS_VARIANCE_POPULATION_IS_SIGNED_DESC',
  ExtrinsicsVariancePopulationIsSuccessAsc = 'EXTRINSICS_VARIANCE_POPULATION_IS_SUCCESS_ASC',
  ExtrinsicsVariancePopulationIsSuccessDesc = 'EXTRINSICS_VARIANCE_POPULATION_IS_SUCCESS_DESC',
  ExtrinsicsVariancePopulationMethodAsc = 'EXTRINSICS_VARIANCE_POPULATION_METHOD_ASC',
  ExtrinsicsVariancePopulationMethodDesc = 'EXTRINSICS_VARIANCE_POPULATION_METHOD_DESC',
  ExtrinsicsVariancePopulationModuleAsc = 'EXTRINSICS_VARIANCE_POPULATION_MODULE_ASC',
  ExtrinsicsVariancePopulationModuleDesc = 'EXTRINSICS_VARIANCE_POPULATION_MODULE_DESC',
  ExtrinsicsVariancePopulationSignerIdAsc = 'EXTRINSICS_VARIANCE_POPULATION_SIGNER_ID_ASC',
  ExtrinsicsVariancePopulationSignerIdDesc = 'EXTRINSICS_VARIANCE_POPULATION_SIGNER_ID_DESC',
  ExtrinsicsVarianceSampleArgumentsAsc = 'EXTRINSICS_VARIANCE_SAMPLE_ARGUMENTS_ASC',
  ExtrinsicsVarianceSampleArgumentsDesc = 'EXTRINSICS_VARIANCE_SAMPLE_ARGUMENTS_DESC',
  ExtrinsicsVarianceSampleBlockIdAsc = 'EXTRINSICS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  ExtrinsicsVarianceSampleBlockIdDesc = 'EXTRINSICS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  ExtrinsicsVarianceSampleBlockNumberAsc = 'EXTRINSICS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  ExtrinsicsVarianceSampleBlockNumberDesc = 'EXTRINSICS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  ExtrinsicsVarianceSampleHashAsc = 'EXTRINSICS_VARIANCE_SAMPLE_HASH_ASC',
  ExtrinsicsVarianceSampleHashDesc = 'EXTRINSICS_VARIANCE_SAMPLE_HASH_DESC',
  ExtrinsicsVarianceSampleIdAsc = 'EXTRINSICS_VARIANCE_SAMPLE_ID_ASC',
  ExtrinsicsVarianceSampleIdDesc = 'EXTRINSICS_VARIANCE_SAMPLE_ID_DESC',
  ExtrinsicsVarianceSampleIndexAsc = 'EXTRINSICS_VARIANCE_SAMPLE_INDEX_ASC',
  ExtrinsicsVarianceSampleIndexDesc = 'EXTRINSICS_VARIANCE_SAMPLE_INDEX_DESC',
  ExtrinsicsVarianceSampleIsSignedAsc = 'EXTRINSICS_VARIANCE_SAMPLE_IS_SIGNED_ASC',
  ExtrinsicsVarianceSampleIsSignedDesc = 'EXTRINSICS_VARIANCE_SAMPLE_IS_SIGNED_DESC',
  ExtrinsicsVarianceSampleIsSuccessAsc = 'EXTRINSICS_VARIANCE_SAMPLE_IS_SUCCESS_ASC',
  ExtrinsicsVarianceSampleIsSuccessDesc = 'EXTRINSICS_VARIANCE_SAMPLE_IS_SUCCESS_DESC',
  ExtrinsicsVarianceSampleMethodAsc = 'EXTRINSICS_VARIANCE_SAMPLE_METHOD_ASC',
  ExtrinsicsVarianceSampleMethodDesc = 'EXTRINSICS_VARIANCE_SAMPLE_METHOD_DESC',
  ExtrinsicsVarianceSampleModuleAsc = 'EXTRINSICS_VARIANCE_SAMPLE_MODULE_ASC',
  ExtrinsicsVarianceSampleModuleDesc = 'EXTRINSICS_VARIANCE_SAMPLE_MODULE_DESC',
  ExtrinsicsVarianceSampleSignerIdAsc = 'EXTRINSICS_VARIANCE_SAMPLE_SIGNER_ID_ASC',
  ExtrinsicsVarianceSampleSignerIdDesc = 'EXTRINSICS_VARIANCE_SAMPLE_SIGNER_ID_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  KeygenThresholdsAverageBlockIdAsc = 'KEYGEN_THRESHOLDS_AVERAGE_BLOCK_ID_ASC',
  KeygenThresholdsAverageBlockIdDesc = 'KEYGEN_THRESHOLDS_AVERAGE_BLOCK_ID_DESC',
  KeygenThresholdsAverageCurrentAsc = 'KEYGEN_THRESHOLDS_AVERAGE_CURRENT_ASC',
  KeygenThresholdsAverageCurrentDesc = 'KEYGEN_THRESHOLDS_AVERAGE_CURRENT_DESC',
  KeygenThresholdsAverageIdAsc = 'KEYGEN_THRESHOLDS_AVERAGE_ID_ASC',
  KeygenThresholdsAverageIdDesc = 'KEYGEN_THRESHOLDS_AVERAGE_ID_DESC',
  KeygenThresholdsAverageNextAsc = 'KEYGEN_THRESHOLDS_AVERAGE_NEXT_ASC',
  KeygenThresholdsAverageNextDesc = 'KEYGEN_THRESHOLDS_AVERAGE_NEXT_DESC',
  KeygenThresholdsAveragePendingAsc = 'KEYGEN_THRESHOLDS_AVERAGE_PENDING_ASC',
  KeygenThresholdsAveragePendingDesc = 'KEYGEN_THRESHOLDS_AVERAGE_PENDING_DESC',
  KeygenThresholdsCountAsc = 'KEYGEN_THRESHOLDS_COUNT_ASC',
  KeygenThresholdsCountDesc = 'KEYGEN_THRESHOLDS_COUNT_DESC',
  KeygenThresholdsDistinctCountBlockIdAsc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_BLOCK_ID_ASC',
  KeygenThresholdsDistinctCountBlockIdDesc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_BLOCK_ID_DESC',
  KeygenThresholdsDistinctCountCurrentAsc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_CURRENT_ASC',
  KeygenThresholdsDistinctCountCurrentDesc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_CURRENT_DESC',
  KeygenThresholdsDistinctCountIdAsc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_ID_ASC',
  KeygenThresholdsDistinctCountIdDesc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_ID_DESC',
  KeygenThresholdsDistinctCountNextAsc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_NEXT_ASC',
  KeygenThresholdsDistinctCountNextDesc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_NEXT_DESC',
  KeygenThresholdsDistinctCountPendingAsc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_PENDING_ASC',
  KeygenThresholdsDistinctCountPendingDesc = 'KEYGEN_THRESHOLDS_DISTINCT_COUNT_PENDING_DESC',
  KeygenThresholdsMaxBlockIdAsc = 'KEYGEN_THRESHOLDS_MAX_BLOCK_ID_ASC',
  KeygenThresholdsMaxBlockIdDesc = 'KEYGEN_THRESHOLDS_MAX_BLOCK_ID_DESC',
  KeygenThresholdsMaxCurrentAsc = 'KEYGEN_THRESHOLDS_MAX_CURRENT_ASC',
  KeygenThresholdsMaxCurrentDesc = 'KEYGEN_THRESHOLDS_MAX_CURRENT_DESC',
  KeygenThresholdsMaxIdAsc = 'KEYGEN_THRESHOLDS_MAX_ID_ASC',
  KeygenThresholdsMaxIdDesc = 'KEYGEN_THRESHOLDS_MAX_ID_DESC',
  KeygenThresholdsMaxNextAsc = 'KEYGEN_THRESHOLDS_MAX_NEXT_ASC',
  KeygenThresholdsMaxNextDesc = 'KEYGEN_THRESHOLDS_MAX_NEXT_DESC',
  KeygenThresholdsMaxPendingAsc = 'KEYGEN_THRESHOLDS_MAX_PENDING_ASC',
  KeygenThresholdsMaxPendingDesc = 'KEYGEN_THRESHOLDS_MAX_PENDING_DESC',
  KeygenThresholdsMinBlockIdAsc = 'KEYGEN_THRESHOLDS_MIN_BLOCK_ID_ASC',
  KeygenThresholdsMinBlockIdDesc = 'KEYGEN_THRESHOLDS_MIN_BLOCK_ID_DESC',
  KeygenThresholdsMinCurrentAsc = 'KEYGEN_THRESHOLDS_MIN_CURRENT_ASC',
  KeygenThresholdsMinCurrentDesc = 'KEYGEN_THRESHOLDS_MIN_CURRENT_DESC',
  KeygenThresholdsMinIdAsc = 'KEYGEN_THRESHOLDS_MIN_ID_ASC',
  KeygenThresholdsMinIdDesc = 'KEYGEN_THRESHOLDS_MIN_ID_DESC',
  KeygenThresholdsMinNextAsc = 'KEYGEN_THRESHOLDS_MIN_NEXT_ASC',
  KeygenThresholdsMinNextDesc = 'KEYGEN_THRESHOLDS_MIN_NEXT_DESC',
  KeygenThresholdsMinPendingAsc = 'KEYGEN_THRESHOLDS_MIN_PENDING_ASC',
  KeygenThresholdsMinPendingDesc = 'KEYGEN_THRESHOLDS_MIN_PENDING_DESC',
  KeygenThresholdsStddevPopulationBlockIdAsc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_BLOCK_ID_ASC',
  KeygenThresholdsStddevPopulationBlockIdDesc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_BLOCK_ID_DESC',
  KeygenThresholdsStddevPopulationCurrentAsc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_CURRENT_ASC',
  KeygenThresholdsStddevPopulationCurrentDesc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_CURRENT_DESC',
  KeygenThresholdsStddevPopulationIdAsc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_ID_ASC',
  KeygenThresholdsStddevPopulationIdDesc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_ID_DESC',
  KeygenThresholdsStddevPopulationNextAsc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_NEXT_ASC',
  KeygenThresholdsStddevPopulationNextDesc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_NEXT_DESC',
  KeygenThresholdsStddevPopulationPendingAsc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_PENDING_ASC',
  KeygenThresholdsStddevPopulationPendingDesc = 'KEYGEN_THRESHOLDS_STDDEV_POPULATION_PENDING_DESC',
  KeygenThresholdsStddevSampleBlockIdAsc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  KeygenThresholdsStddevSampleBlockIdDesc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  KeygenThresholdsStddevSampleCurrentAsc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_CURRENT_ASC',
  KeygenThresholdsStddevSampleCurrentDesc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_CURRENT_DESC',
  KeygenThresholdsStddevSampleIdAsc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_ID_ASC',
  KeygenThresholdsStddevSampleIdDesc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_ID_DESC',
  KeygenThresholdsStddevSampleNextAsc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_NEXT_ASC',
  KeygenThresholdsStddevSampleNextDesc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_NEXT_DESC',
  KeygenThresholdsStddevSamplePendingAsc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_PENDING_ASC',
  KeygenThresholdsStddevSamplePendingDesc = 'KEYGEN_THRESHOLDS_STDDEV_SAMPLE_PENDING_DESC',
  KeygenThresholdsSumBlockIdAsc = 'KEYGEN_THRESHOLDS_SUM_BLOCK_ID_ASC',
  KeygenThresholdsSumBlockIdDesc = 'KEYGEN_THRESHOLDS_SUM_BLOCK_ID_DESC',
  KeygenThresholdsSumCurrentAsc = 'KEYGEN_THRESHOLDS_SUM_CURRENT_ASC',
  KeygenThresholdsSumCurrentDesc = 'KEYGEN_THRESHOLDS_SUM_CURRENT_DESC',
  KeygenThresholdsSumIdAsc = 'KEYGEN_THRESHOLDS_SUM_ID_ASC',
  KeygenThresholdsSumIdDesc = 'KEYGEN_THRESHOLDS_SUM_ID_DESC',
  KeygenThresholdsSumNextAsc = 'KEYGEN_THRESHOLDS_SUM_NEXT_ASC',
  KeygenThresholdsSumNextDesc = 'KEYGEN_THRESHOLDS_SUM_NEXT_DESC',
  KeygenThresholdsSumPendingAsc = 'KEYGEN_THRESHOLDS_SUM_PENDING_ASC',
  KeygenThresholdsSumPendingDesc = 'KEYGEN_THRESHOLDS_SUM_PENDING_DESC',
  KeygenThresholdsVariancePopulationBlockIdAsc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  KeygenThresholdsVariancePopulationBlockIdDesc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  KeygenThresholdsVariancePopulationCurrentAsc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_CURRENT_ASC',
  KeygenThresholdsVariancePopulationCurrentDesc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_CURRENT_DESC',
  KeygenThresholdsVariancePopulationIdAsc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_ID_ASC',
  KeygenThresholdsVariancePopulationIdDesc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_ID_DESC',
  KeygenThresholdsVariancePopulationNextAsc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_NEXT_ASC',
  KeygenThresholdsVariancePopulationNextDesc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_NEXT_DESC',
  KeygenThresholdsVariancePopulationPendingAsc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_PENDING_ASC',
  KeygenThresholdsVariancePopulationPendingDesc = 'KEYGEN_THRESHOLDS_VARIANCE_POPULATION_PENDING_DESC',
  KeygenThresholdsVarianceSampleBlockIdAsc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  KeygenThresholdsVarianceSampleBlockIdDesc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  KeygenThresholdsVarianceSampleCurrentAsc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_CURRENT_ASC',
  KeygenThresholdsVarianceSampleCurrentDesc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_CURRENT_DESC',
  KeygenThresholdsVarianceSampleIdAsc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_ID_ASC',
  KeygenThresholdsVarianceSampleIdDesc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_ID_DESC',
  KeygenThresholdsVarianceSampleNextAsc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_NEXT_ASC',
  KeygenThresholdsVarianceSampleNextDesc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_NEXT_DESC',
  KeygenThresholdsVarianceSamplePendingAsc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_PENDING_ASC',
  KeygenThresholdsVarianceSamplePendingDesc = 'KEYGEN_THRESHOLDS_VARIANCE_SAMPLE_PENDING_DESC',
  Natural = 'NATURAL',
  NumberAsc = 'NUMBER_ASC',
  NumberDesc = 'NUMBER_DESC',
  ParentHashAsc = 'PARENT_HASH_ASC',
  ParentHashDesc = 'PARENT_HASH_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SessionsAverageAuthoritiesAsc = 'SESSIONS_AVERAGE_AUTHORITIES_ASC',
  SessionsAverageAuthoritiesDesc = 'SESSIONS_AVERAGE_AUTHORITIES_DESC',
  SessionsAverageBestAuthoritiesAsc = 'SESSIONS_AVERAGE_BEST_AUTHORITIES_ASC',
  SessionsAverageBestAuthoritiesDesc = 'SESSIONS_AVERAGE_BEST_AUTHORITIES_DESC',
  SessionsAverageBlockIdAsc = 'SESSIONS_AVERAGE_BLOCK_ID_ASC',
  SessionsAverageBlockIdDesc = 'SESSIONS_AVERAGE_BLOCK_ID_DESC',
  SessionsAverageBlockNumberAsc = 'SESSIONS_AVERAGE_BLOCK_NUMBER_ASC',
  SessionsAverageBlockNumberDesc = 'SESSIONS_AVERAGE_BLOCK_NUMBER_DESC',
  SessionsAverageIdAsc = 'SESSIONS_AVERAGE_ID_ASC',
  SessionsAverageIdDesc = 'SESSIONS_AVERAGE_ID_DESC',
  SessionsAverageKeyGenThresholdAsc = 'SESSIONS_AVERAGE_KEY_GEN_THRESHOLD_ASC',
  SessionsAverageKeyGenThresholdDesc = 'SESSIONS_AVERAGE_KEY_GEN_THRESHOLD_DESC',
  SessionsAverageNextAuthoritiesAsc = 'SESSIONS_AVERAGE_NEXT_AUTHORITIES_ASC',
  SessionsAverageNextAuthoritiesDesc = 'SESSIONS_AVERAGE_NEXT_AUTHORITIES_DESC',
  SessionsAverageNextBestAuthoritiesAsc = 'SESSIONS_AVERAGE_NEXT_BEST_AUTHORITIES_ASC',
  SessionsAverageNextBestAuthoritiesDesc = 'SESSIONS_AVERAGE_NEXT_BEST_AUTHORITIES_DESC',
  SessionsAverageProposersAsc = 'SESSIONS_AVERAGE_PROPOSERS_ASC',
  SessionsAverageProposersCountAsc = 'SESSIONS_AVERAGE_PROPOSERS_COUNT_ASC',
  SessionsAverageProposersCountDesc = 'SESSIONS_AVERAGE_PROPOSERS_COUNT_DESC',
  SessionsAverageProposersDesc = 'SESSIONS_AVERAGE_PROPOSERS_DESC',
  SessionsAverageProposerThresholdAsc = 'SESSIONS_AVERAGE_PROPOSER_THRESHOLD_ASC',
  SessionsAverageProposerThresholdDesc = 'SESSIONS_AVERAGE_PROPOSER_THRESHOLD_DESC',
  SessionsAverageSignatureThresholdAsc = 'SESSIONS_AVERAGE_SIGNATURE_THRESHOLD_ASC',
  SessionsAverageSignatureThresholdDesc = 'SESSIONS_AVERAGE_SIGNATURE_THRESHOLD_DESC',
  SessionsCountAsc = 'SESSIONS_COUNT_ASC',
  SessionsCountDesc = 'SESSIONS_COUNT_DESC',
  SessionsDistinctCountAuthoritiesAsc = 'SESSIONS_DISTINCT_COUNT_AUTHORITIES_ASC',
  SessionsDistinctCountAuthoritiesDesc = 'SESSIONS_DISTINCT_COUNT_AUTHORITIES_DESC',
  SessionsDistinctCountBestAuthoritiesAsc = 'SESSIONS_DISTINCT_COUNT_BEST_AUTHORITIES_ASC',
  SessionsDistinctCountBestAuthoritiesDesc = 'SESSIONS_DISTINCT_COUNT_BEST_AUTHORITIES_DESC',
  SessionsDistinctCountBlockIdAsc = 'SESSIONS_DISTINCT_COUNT_BLOCK_ID_ASC',
  SessionsDistinctCountBlockIdDesc = 'SESSIONS_DISTINCT_COUNT_BLOCK_ID_DESC',
  SessionsDistinctCountBlockNumberAsc = 'SESSIONS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  SessionsDistinctCountBlockNumberDesc = 'SESSIONS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  SessionsDistinctCountIdAsc = 'SESSIONS_DISTINCT_COUNT_ID_ASC',
  SessionsDistinctCountIdDesc = 'SESSIONS_DISTINCT_COUNT_ID_DESC',
  SessionsDistinctCountKeyGenThresholdAsc = 'SESSIONS_DISTINCT_COUNT_KEY_GEN_THRESHOLD_ASC',
  SessionsDistinctCountKeyGenThresholdDesc = 'SESSIONS_DISTINCT_COUNT_KEY_GEN_THRESHOLD_DESC',
  SessionsDistinctCountNextAuthoritiesAsc = 'SESSIONS_DISTINCT_COUNT_NEXT_AUTHORITIES_ASC',
  SessionsDistinctCountNextAuthoritiesDesc = 'SESSIONS_DISTINCT_COUNT_NEXT_AUTHORITIES_DESC',
  SessionsDistinctCountNextBestAuthoritiesAsc = 'SESSIONS_DISTINCT_COUNT_NEXT_BEST_AUTHORITIES_ASC',
  SessionsDistinctCountNextBestAuthoritiesDesc = 'SESSIONS_DISTINCT_COUNT_NEXT_BEST_AUTHORITIES_DESC',
  SessionsDistinctCountProposersAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_ASC',
  SessionsDistinctCountProposersCountAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_COUNT_ASC',
  SessionsDistinctCountProposersCountDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_COUNT_DESC',
  SessionsDistinctCountProposersDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_DESC',
  SessionsDistinctCountProposerThresholdAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSER_THRESHOLD_ASC',
  SessionsDistinctCountProposerThresholdDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSER_THRESHOLD_DESC',
  SessionsDistinctCountSignatureThresholdAsc = 'SESSIONS_DISTINCT_COUNT_SIGNATURE_THRESHOLD_ASC',
  SessionsDistinctCountSignatureThresholdDesc = 'SESSIONS_DISTINCT_COUNT_SIGNATURE_THRESHOLD_DESC',
  SessionsMaxAuthoritiesAsc = 'SESSIONS_MAX_AUTHORITIES_ASC',
  SessionsMaxAuthoritiesDesc = 'SESSIONS_MAX_AUTHORITIES_DESC',
  SessionsMaxBestAuthoritiesAsc = 'SESSIONS_MAX_BEST_AUTHORITIES_ASC',
  SessionsMaxBestAuthoritiesDesc = 'SESSIONS_MAX_BEST_AUTHORITIES_DESC',
  SessionsMaxBlockIdAsc = 'SESSIONS_MAX_BLOCK_ID_ASC',
  SessionsMaxBlockIdDesc = 'SESSIONS_MAX_BLOCK_ID_DESC',
  SessionsMaxBlockNumberAsc = 'SESSIONS_MAX_BLOCK_NUMBER_ASC',
  SessionsMaxBlockNumberDesc = 'SESSIONS_MAX_BLOCK_NUMBER_DESC',
  SessionsMaxIdAsc = 'SESSIONS_MAX_ID_ASC',
  SessionsMaxIdDesc = 'SESSIONS_MAX_ID_DESC',
  SessionsMaxKeyGenThresholdAsc = 'SESSIONS_MAX_KEY_GEN_THRESHOLD_ASC',
  SessionsMaxKeyGenThresholdDesc = 'SESSIONS_MAX_KEY_GEN_THRESHOLD_DESC',
  SessionsMaxNextAuthoritiesAsc = 'SESSIONS_MAX_NEXT_AUTHORITIES_ASC',
  SessionsMaxNextAuthoritiesDesc = 'SESSIONS_MAX_NEXT_AUTHORITIES_DESC',
  SessionsMaxNextBestAuthoritiesAsc = 'SESSIONS_MAX_NEXT_BEST_AUTHORITIES_ASC',
  SessionsMaxNextBestAuthoritiesDesc = 'SESSIONS_MAX_NEXT_BEST_AUTHORITIES_DESC',
  SessionsMaxProposersAsc = 'SESSIONS_MAX_PROPOSERS_ASC',
  SessionsMaxProposersCountAsc = 'SESSIONS_MAX_PROPOSERS_COUNT_ASC',
  SessionsMaxProposersCountDesc = 'SESSIONS_MAX_PROPOSERS_COUNT_DESC',
  SessionsMaxProposersDesc = 'SESSIONS_MAX_PROPOSERS_DESC',
  SessionsMaxProposerThresholdAsc = 'SESSIONS_MAX_PROPOSER_THRESHOLD_ASC',
  SessionsMaxProposerThresholdDesc = 'SESSIONS_MAX_PROPOSER_THRESHOLD_DESC',
  SessionsMaxSignatureThresholdAsc = 'SESSIONS_MAX_SIGNATURE_THRESHOLD_ASC',
  SessionsMaxSignatureThresholdDesc = 'SESSIONS_MAX_SIGNATURE_THRESHOLD_DESC',
  SessionsMinAuthoritiesAsc = 'SESSIONS_MIN_AUTHORITIES_ASC',
  SessionsMinAuthoritiesDesc = 'SESSIONS_MIN_AUTHORITIES_DESC',
  SessionsMinBestAuthoritiesAsc = 'SESSIONS_MIN_BEST_AUTHORITIES_ASC',
  SessionsMinBestAuthoritiesDesc = 'SESSIONS_MIN_BEST_AUTHORITIES_DESC',
  SessionsMinBlockIdAsc = 'SESSIONS_MIN_BLOCK_ID_ASC',
  SessionsMinBlockIdDesc = 'SESSIONS_MIN_BLOCK_ID_DESC',
  SessionsMinBlockNumberAsc = 'SESSIONS_MIN_BLOCK_NUMBER_ASC',
  SessionsMinBlockNumberDesc = 'SESSIONS_MIN_BLOCK_NUMBER_DESC',
  SessionsMinIdAsc = 'SESSIONS_MIN_ID_ASC',
  SessionsMinIdDesc = 'SESSIONS_MIN_ID_DESC',
  SessionsMinKeyGenThresholdAsc = 'SESSIONS_MIN_KEY_GEN_THRESHOLD_ASC',
  SessionsMinKeyGenThresholdDesc = 'SESSIONS_MIN_KEY_GEN_THRESHOLD_DESC',
  SessionsMinNextAuthoritiesAsc = 'SESSIONS_MIN_NEXT_AUTHORITIES_ASC',
  SessionsMinNextAuthoritiesDesc = 'SESSIONS_MIN_NEXT_AUTHORITIES_DESC',
  SessionsMinNextBestAuthoritiesAsc = 'SESSIONS_MIN_NEXT_BEST_AUTHORITIES_ASC',
  SessionsMinNextBestAuthoritiesDesc = 'SESSIONS_MIN_NEXT_BEST_AUTHORITIES_DESC',
  SessionsMinProposersAsc = 'SESSIONS_MIN_PROPOSERS_ASC',
  SessionsMinProposersCountAsc = 'SESSIONS_MIN_PROPOSERS_COUNT_ASC',
  SessionsMinProposersCountDesc = 'SESSIONS_MIN_PROPOSERS_COUNT_DESC',
  SessionsMinProposersDesc = 'SESSIONS_MIN_PROPOSERS_DESC',
  SessionsMinProposerThresholdAsc = 'SESSIONS_MIN_PROPOSER_THRESHOLD_ASC',
  SessionsMinProposerThresholdDesc = 'SESSIONS_MIN_PROPOSER_THRESHOLD_DESC',
  SessionsMinSignatureThresholdAsc = 'SESSIONS_MIN_SIGNATURE_THRESHOLD_ASC',
  SessionsMinSignatureThresholdDesc = 'SESSIONS_MIN_SIGNATURE_THRESHOLD_DESC',
  SessionsStddevPopulationAuthoritiesAsc = 'SESSIONS_STDDEV_POPULATION_AUTHORITIES_ASC',
  SessionsStddevPopulationAuthoritiesDesc = 'SESSIONS_STDDEV_POPULATION_AUTHORITIES_DESC',
  SessionsStddevPopulationBestAuthoritiesAsc = 'SESSIONS_STDDEV_POPULATION_BEST_AUTHORITIES_ASC',
  SessionsStddevPopulationBestAuthoritiesDesc = 'SESSIONS_STDDEV_POPULATION_BEST_AUTHORITIES_DESC',
  SessionsStddevPopulationBlockIdAsc = 'SESSIONS_STDDEV_POPULATION_BLOCK_ID_ASC',
  SessionsStddevPopulationBlockIdDesc = 'SESSIONS_STDDEV_POPULATION_BLOCK_ID_DESC',
  SessionsStddevPopulationBlockNumberAsc = 'SESSIONS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  SessionsStddevPopulationBlockNumberDesc = 'SESSIONS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  SessionsStddevPopulationIdAsc = 'SESSIONS_STDDEV_POPULATION_ID_ASC',
  SessionsStddevPopulationIdDesc = 'SESSIONS_STDDEV_POPULATION_ID_DESC',
  SessionsStddevPopulationKeyGenThresholdAsc = 'SESSIONS_STDDEV_POPULATION_KEY_GEN_THRESHOLD_ASC',
  SessionsStddevPopulationKeyGenThresholdDesc = 'SESSIONS_STDDEV_POPULATION_KEY_GEN_THRESHOLD_DESC',
  SessionsStddevPopulationNextAuthoritiesAsc = 'SESSIONS_STDDEV_POPULATION_NEXT_AUTHORITIES_ASC',
  SessionsStddevPopulationNextAuthoritiesDesc = 'SESSIONS_STDDEV_POPULATION_NEXT_AUTHORITIES_DESC',
  SessionsStddevPopulationNextBestAuthoritiesAsc = 'SESSIONS_STDDEV_POPULATION_NEXT_BEST_AUTHORITIES_ASC',
  SessionsStddevPopulationNextBestAuthoritiesDesc = 'SESSIONS_STDDEV_POPULATION_NEXT_BEST_AUTHORITIES_DESC',
  SessionsStddevPopulationProposersAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_ASC',
  SessionsStddevPopulationProposersCountAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_COUNT_ASC',
  SessionsStddevPopulationProposersCountDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_COUNT_DESC',
  SessionsStddevPopulationProposersDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_DESC',
  SessionsStddevPopulationProposerThresholdAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSER_THRESHOLD_ASC',
  SessionsStddevPopulationProposerThresholdDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSER_THRESHOLD_DESC',
  SessionsStddevPopulationSignatureThresholdAsc = 'SESSIONS_STDDEV_POPULATION_SIGNATURE_THRESHOLD_ASC',
  SessionsStddevPopulationSignatureThresholdDesc = 'SESSIONS_STDDEV_POPULATION_SIGNATURE_THRESHOLD_DESC',
  SessionsStddevSampleAuthoritiesAsc = 'SESSIONS_STDDEV_SAMPLE_AUTHORITIES_ASC',
  SessionsStddevSampleAuthoritiesDesc = 'SESSIONS_STDDEV_SAMPLE_AUTHORITIES_DESC',
  SessionsStddevSampleBestAuthoritiesAsc = 'SESSIONS_STDDEV_SAMPLE_BEST_AUTHORITIES_ASC',
  SessionsStddevSampleBestAuthoritiesDesc = 'SESSIONS_STDDEV_SAMPLE_BEST_AUTHORITIES_DESC',
  SessionsStddevSampleBlockIdAsc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  SessionsStddevSampleBlockIdDesc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  SessionsStddevSampleBlockNumberAsc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  SessionsStddevSampleBlockNumberDesc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  SessionsStddevSampleIdAsc = 'SESSIONS_STDDEV_SAMPLE_ID_ASC',
  SessionsStddevSampleIdDesc = 'SESSIONS_STDDEV_SAMPLE_ID_DESC',
  SessionsStddevSampleKeyGenThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_KEY_GEN_THRESHOLD_ASC',
  SessionsStddevSampleKeyGenThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_KEY_GEN_THRESHOLD_DESC',
  SessionsStddevSampleNextAuthoritiesAsc = 'SESSIONS_STDDEV_SAMPLE_NEXT_AUTHORITIES_ASC',
  SessionsStddevSampleNextAuthoritiesDesc = 'SESSIONS_STDDEV_SAMPLE_NEXT_AUTHORITIES_DESC',
  SessionsStddevSampleNextBestAuthoritiesAsc = 'SESSIONS_STDDEV_SAMPLE_NEXT_BEST_AUTHORITIES_ASC',
  SessionsStddevSampleNextBestAuthoritiesDesc = 'SESSIONS_STDDEV_SAMPLE_NEXT_BEST_AUTHORITIES_DESC',
  SessionsStddevSampleProposersAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_ASC',
  SessionsStddevSampleProposersCountAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_COUNT_ASC',
  SessionsStddevSampleProposersCountDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_COUNT_DESC',
  SessionsStddevSampleProposersDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_DESC',
  SessionsStddevSampleProposerThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSER_THRESHOLD_ASC',
  SessionsStddevSampleProposerThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSER_THRESHOLD_DESC',
  SessionsStddevSampleSignatureThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_SIGNATURE_THRESHOLD_ASC',
  SessionsStddevSampleSignatureThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_SIGNATURE_THRESHOLD_DESC',
  SessionsSumAuthoritiesAsc = 'SESSIONS_SUM_AUTHORITIES_ASC',
  SessionsSumAuthoritiesDesc = 'SESSIONS_SUM_AUTHORITIES_DESC',
  SessionsSumBestAuthoritiesAsc = 'SESSIONS_SUM_BEST_AUTHORITIES_ASC',
  SessionsSumBestAuthoritiesDesc = 'SESSIONS_SUM_BEST_AUTHORITIES_DESC',
  SessionsSumBlockIdAsc = 'SESSIONS_SUM_BLOCK_ID_ASC',
  SessionsSumBlockIdDesc = 'SESSIONS_SUM_BLOCK_ID_DESC',
  SessionsSumBlockNumberAsc = 'SESSIONS_SUM_BLOCK_NUMBER_ASC',
  SessionsSumBlockNumberDesc = 'SESSIONS_SUM_BLOCK_NUMBER_DESC',
  SessionsSumIdAsc = 'SESSIONS_SUM_ID_ASC',
  SessionsSumIdDesc = 'SESSIONS_SUM_ID_DESC',
  SessionsSumKeyGenThresholdAsc = 'SESSIONS_SUM_KEY_GEN_THRESHOLD_ASC',
  SessionsSumKeyGenThresholdDesc = 'SESSIONS_SUM_KEY_GEN_THRESHOLD_DESC',
  SessionsSumNextAuthoritiesAsc = 'SESSIONS_SUM_NEXT_AUTHORITIES_ASC',
  SessionsSumNextAuthoritiesDesc = 'SESSIONS_SUM_NEXT_AUTHORITIES_DESC',
  SessionsSumNextBestAuthoritiesAsc = 'SESSIONS_SUM_NEXT_BEST_AUTHORITIES_ASC',
  SessionsSumNextBestAuthoritiesDesc = 'SESSIONS_SUM_NEXT_BEST_AUTHORITIES_DESC',
  SessionsSumProposersAsc = 'SESSIONS_SUM_PROPOSERS_ASC',
  SessionsSumProposersCountAsc = 'SESSIONS_SUM_PROPOSERS_COUNT_ASC',
  SessionsSumProposersCountDesc = 'SESSIONS_SUM_PROPOSERS_COUNT_DESC',
  SessionsSumProposersDesc = 'SESSIONS_SUM_PROPOSERS_DESC',
  SessionsSumProposerThresholdAsc = 'SESSIONS_SUM_PROPOSER_THRESHOLD_ASC',
  SessionsSumProposerThresholdDesc = 'SESSIONS_SUM_PROPOSER_THRESHOLD_DESC',
  SessionsSumSignatureThresholdAsc = 'SESSIONS_SUM_SIGNATURE_THRESHOLD_ASC',
  SessionsSumSignatureThresholdDesc = 'SESSIONS_SUM_SIGNATURE_THRESHOLD_DESC',
  SessionsVariancePopulationAuthoritiesAsc = 'SESSIONS_VARIANCE_POPULATION_AUTHORITIES_ASC',
  SessionsVariancePopulationAuthoritiesDesc = 'SESSIONS_VARIANCE_POPULATION_AUTHORITIES_DESC',
  SessionsVariancePopulationBestAuthoritiesAsc = 'SESSIONS_VARIANCE_POPULATION_BEST_AUTHORITIES_ASC',
  SessionsVariancePopulationBestAuthoritiesDesc = 'SESSIONS_VARIANCE_POPULATION_BEST_AUTHORITIES_DESC',
  SessionsVariancePopulationBlockIdAsc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  SessionsVariancePopulationBlockIdDesc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  SessionsVariancePopulationBlockNumberAsc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  SessionsVariancePopulationBlockNumberDesc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  SessionsVariancePopulationIdAsc = 'SESSIONS_VARIANCE_POPULATION_ID_ASC',
  SessionsVariancePopulationIdDesc = 'SESSIONS_VARIANCE_POPULATION_ID_DESC',
  SessionsVariancePopulationKeyGenThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_KEY_GEN_THRESHOLD_ASC',
  SessionsVariancePopulationKeyGenThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_KEY_GEN_THRESHOLD_DESC',
  SessionsVariancePopulationNextAuthoritiesAsc = 'SESSIONS_VARIANCE_POPULATION_NEXT_AUTHORITIES_ASC',
  SessionsVariancePopulationNextAuthoritiesDesc = 'SESSIONS_VARIANCE_POPULATION_NEXT_AUTHORITIES_DESC',
  SessionsVariancePopulationNextBestAuthoritiesAsc = 'SESSIONS_VARIANCE_POPULATION_NEXT_BEST_AUTHORITIES_ASC',
  SessionsVariancePopulationNextBestAuthoritiesDesc = 'SESSIONS_VARIANCE_POPULATION_NEXT_BEST_AUTHORITIES_DESC',
  SessionsVariancePopulationProposersAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_ASC',
  SessionsVariancePopulationProposersCountAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_COUNT_ASC',
  SessionsVariancePopulationProposersCountDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_COUNT_DESC',
  SessionsVariancePopulationProposersDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_DESC',
  SessionsVariancePopulationProposerThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSER_THRESHOLD_ASC',
  SessionsVariancePopulationProposerThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSER_THRESHOLD_DESC',
  SessionsVariancePopulationSignatureThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_SIGNATURE_THRESHOLD_ASC',
  SessionsVariancePopulationSignatureThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_SIGNATURE_THRESHOLD_DESC',
  SessionsVarianceSampleAuthoritiesAsc = 'SESSIONS_VARIANCE_SAMPLE_AUTHORITIES_ASC',
  SessionsVarianceSampleAuthoritiesDesc = 'SESSIONS_VARIANCE_SAMPLE_AUTHORITIES_DESC',
  SessionsVarianceSampleBestAuthoritiesAsc = 'SESSIONS_VARIANCE_SAMPLE_BEST_AUTHORITIES_ASC',
  SessionsVarianceSampleBestAuthoritiesDesc = 'SESSIONS_VARIANCE_SAMPLE_BEST_AUTHORITIES_DESC',
  SessionsVarianceSampleBlockIdAsc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  SessionsVarianceSampleBlockIdDesc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  SessionsVarianceSampleBlockNumberAsc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  SessionsVarianceSampleBlockNumberDesc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  SessionsVarianceSampleIdAsc = 'SESSIONS_VARIANCE_SAMPLE_ID_ASC',
  SessionsVarianceSampleIdDesc = 'SESSIONS_VARIANCE_SAMPLE_ID_DESC',
  SessionsVarianceSampleKeyGenThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_KEY_GEN_THRESHOLD_ASC',
  SessionsVarianceSampleKeyGenThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_KEY_GEN_THRESHOLD_DESC',
  SessionsVarianceSampleNextAuthoritiesAsc = 'SESSIONS_VARIANCE_SAMPLE_NEXT_AUTHORITIES_ASC',
  SessionsVarianceSampleNextAuthoritiesDesc = 'SESSIONS_VARIANCE_SAMPLE_NEXT_AUTHORITIES_DESC',
  SessionsVarianceSampleNextBestAuthoritiesAsc = 'SESSIONS_VARIANCE_SAMPLE_NEXT_BEST_AUTHORITIES_ASC',
  SessionsVarianceSampleNextBestAuthoritiesDesc = 'SESSIONS_VARIANCE_SAMPLE_NEXT_BEST_AUTHORITIES_DESC',
  SessionsVarianceSampleProposersAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_ASC',
  SessionsVarianceSampleProposersCountAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_COUNT_ASC',
  SessionsVarianceSampleProposersCountDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_COUNT_DESC',
  SessionsVarianceSampleProposersDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_DESC',
  SessionsVarianceSampleProposerThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSER_THRESHOLD_ASC',
  SessionsVarianceSampleProposerThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSER_THRESHOLD_DESC',
  SessionsVarianceSampleSignatureThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_SIGNATURE_THRESHOLD_ASC',
  SessionsVarianceSampleSignatureThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_SIGNATURE_THRESHOLD_DESC',
  SignatureThresholdsAverageBlockIdAsc = 'SIGNATURE_THRESHOLDS_AVERAGE_BLOCK_ID_ASC',
  SignatureThresholdsAverageBlockIdDesc = 'SIGNATURE_THRESHOLDS_AVERAGE_BLOCK_ID_DESC',
  SignatureThresholdsAverageCurrentAsc = 'SIGNATURE_THRESHOLDS_AVERAGE_CURRENT_ASC',
  SignatureThresholdsAverageCurrentDesc = 'SIGNATURE_THRESHOLDS_AVERAGE_CURRENT_DESC',
  SignatureThresholdsAverageIdAsc = 'SIGNATURE_THRESHOLDS_AVERAGE_ID_ASC',
  SignatureThresholdsAverageIdDesc = 'SIGNATURE_THRESHOLDS_AVERAGE_ID_DESC',
  SignatureThresholdsAverageNextAsc = 'SIGNATURE_THRESHOLDS_AVERAGE_NEXT_ASC',
  SignatureThresholdsAverageNextDesc = 'SIGNATURE_THRESHOLDS_AVERAGE_NEXT_DESC',
  SignatureThresholdsAveragePendingAsc = 'SIGNATURE_THRESHOLDS_AVERAGE_PENDING_ASC',
  SignatureThresholdsAveragePendingDesc = 'SIGNATURE_THRESHOLDS_AVERAGE_PENDING_DESC',
  SignatureThresholdsCountAsc = 'SIGNATURE_THRESHOLDS_COUNT_ASC',
  SignatureThresholdsCountDesc = 'SIGNATURE_THRESHOLDS_COUNT_DESC',
  SignatureThresholdsDistinctCountBlockIdAsc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_BLOCK_ID_ASC',
  SignatureThresholdsDistinctCountBlockIdDesc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_BLOCK_ID_DESC',
  SignatureThresholdsDistinctCountCurrentAsc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_CURRENT_ASC',
  SignatureThresholdsDistinctCountCurrentDesc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_CURRENT_DESC',
  SignatureThresholdsDistinctCountIdAsc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_ID_ASC',
  SignatureThresholdsDistinctCountIdDesc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_ID_DESC',
  SignatureThresholdsDistinctCountNextAsc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_NEXT_ASC',
  SignatureThresholdsDistinctCountNextDesc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_NEXT_DESC',
  SignatureThresholdsDistinctCountPendingAsc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_PENDING_ASC',
  SignatureThresholdsDistinctCountPendingDesc = 'SIGNATURE_THRESHOLDS_DISTINCT_COUNT_PENDING_DESC',
  SignatureThresholdsMaxBlockIdAsc = 'SIGNATURE_THRESHOLDS_MAX_BLOCK_ID_ASC',
  SignatureThresholdsMaxBlockIdDesc = 'SIGNATURE_THRESHOLDS_MAX_BLOCK_ID_DESC',
  SignatureThresholdsMaxCurrentAsc = 'SIGNATURE_THRESHOLDS_MAX_CURRENT_ASC',
  SignatureThresholdsMaxCurrentDesc = 'SIGNATURE_THRESHOLDS_MAX_CURRENT_DESC',
  SignatureThresholdsMaxIdAsc = 'SIGNATURE_THRESHOLDS_MAX_ID_ASC',
  SignatureThresholdsMaxIdDesc = 'SIGNATURE_THRESHOLDS_MAX_ID_DESC',
  SignatureThresholdsMaxNextAsc = 'SIGNATURE_THRESHOLDS_MAX_NEXT_ASC',
  SignatureThresholdsMaxNextDesc = 'SIGNATURE_THRESHOLDS_MAX_NEXT_DESC',
  SignatureThresholdsMaxPendingAsc = 'SIGNATURE_THRESHOLDS_MAX_PENDING_ASC',
  SignatureThresholdsMaxPendingDesc = 'SIGNATURE_THRESHOLDS_MAX_PENDING_DESC',
  SignatureThresholdsMinBlockIdAsc = 'SIGNATURE_THRESHOLDS_MIN_BLOCK_ID_ASC',
  SignatureThresholdsMinBlockIdDesc = 'SIGNATURE_THRESHOLDS_MIN_BLOCK_ID_DESC',
  SignatureThresholdsMinCurrentAsc = 'SIGNATURE_THRESHOLDS_MIN_CURRENT_ASC',
  SignatureThresholdsMinCurrentDesc = 'SIGNATURE_THRESHOLDS_MIN_CURRENT_DESC',
  SignatureThresholdsMinIdAsc = 'SIGNATURE_THRESHOLDS_MIN_ID_ASC',
  SignatureThresholdsMinIdDesc = 'SIGNATURE_THRESHOLDS_MIN_ID_DESC',
  SignatureThresholdsMinNextAsc = 'SIGNATURE_THRESHOLDS_MIN_NEXT_ASC',
  SignatureThresholdsMinNextDesc = 'SIGNATURE_THRESHOLDS_MIN_NEXT_DESC',
  SignatureThresholdsMinPendingAsc = 'SIGNATURE_THRESHOLDS_MIN_PENDING_ASC',
  SignatureThresholdsMinPendingDesc = 'SIGNATURE_THRESHOLDS_MIN_PENDING_DESC',
  SignatureThresholdsStddevPopulationBlockIdAsc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_BLOCK_ID_ASC',
  SignatureThresholdsStddevPopulationBlockIdDesc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_BLOCK_ID_DESC',
  SignatureThresholdsStddevPopulationCurrentAsc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_CURRENT_ASC',
  SignatureThresholdsStddevPopulationCurrentDesc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_CURRENT_DESC',
  SignatureThresholdsStddevPopulationIdAsc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_ID_ASC',
  SignatureThresholdsStddevPopulationIdDesc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_ID_DESC',
  SignatureThresholdsStddevPopulationNextAsc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_NEXT_ASC',
  SignatureThresholdsStddevPopulationNextDesc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_NEXT_DESC',
  SignatureThresholdsStddevPopulationPendingAsc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_PENDING_ASC',
  SignatureThresholdsStddevPopulationPendingDesc = 'SIGNATURE_THRESHOLDS_STDDEV_POPULATION_PENDING_DESC',
  SignatureThresholdsStddevSampleBlockIdAsc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  SignatureThresholdsStddevSampleBlockIdDesc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  SignatureThresholdsStddevSampleCurrentAsc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_CURRENT_ASC',
  SignatureThresholdsStddevSampleCurrentDesc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_CURRENT_DESC',
  SignatureThresholdsStddevSampleIdAsc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_ID_ASC',
  SignatureThresholdsStddevSampleIdDesc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_ID_DESC',
  SignatureThresholdsStddevSampleNextAsc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_NEXT_ASC',
  SignatureThresholdsStddevSampleNextDesc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_NEXT_DESC',
  SignatureThresholdsStddevSamplePendingAsc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_PENDING_ASC',
  SignatureThresholdsStddevSamplePendingDesc = 'SIGNATURE_THRESHOLDS_STDDEV_SAMPLE_PENDING_DESC',
  SignatureThresholdsSumBlockIdAsc = 'SIGNATURE_THRESHOLDS_SUM_BLOCK_ID_ASC',
  SignatureThresholdsSumBlockIdDesc = 'SIGNATURE_THRESHOLDS_SUM_BLOCK_ID_DESC',
  SignatureThresholdsSumCurrentAsc = 'SIGNATURE_THRESHOLDS_SUM_CURRENT_ASC',
  SignatureThresholdsSumCurrentDesc = 'SIGNATURE_THRESHOLDS_SUM_CURRENT_DESC',
  SignatureThresholdsSumIdAsc = 'SIGNATURE_THRESHOLDS_SUM_ID_ASC',
  SignatureThresholdsSumIdDesc = 'SIGNATURE_THRESHOLDS_SUM_ID_DESC',
  SignatureThresholdsSumNextAsc = 'SIGNATURE_THRESHOLDS_SUM_NEXT_ASC',
  SignatureThresholdsSumNextDesc = 'SIGNATURE_THRESHOLDS_SUM_NEXT_DESC',
  SignatureThresholdsSumPendingAsc = 'SIGNATURE_THRESHOLDS_SUM_PENDING_ASC',
  SignatureThresholdsSumPendingDesc = 'SIGNATURE_THRESHOLDS_SUM_PENDING_DESC',
  SignatureThresholdsVariancePopulationBlockIdAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  SignatureThresholdsVariancePopulationBlockIdDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  SignatureThresholdsVariancePopulationCurrentAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_CURRENT_ASC',
  SignatureThresholdsVariancePopulationCurrentDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_CURRENT_DESC',
  SignatureThresholdsVariancePopulationIdAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_ID_ASC',
  SignatureThresholdsVariancePopulationIdDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_ID_DESC',
  SignatureThresholdsVariancePopulationNextAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_NEXT_ASC',
  SignatureThresholdsVariancePopulationNextDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_NEXT_DESC',
  SignatureThresholdsVariancePopulationPendingAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_PENDING_ASC',
  SignatureThresholdsVariancePopulationPendingDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_POPULATION_PENDING_DESC',
  SignatureThresholdsVarianceSampleBlockIdAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  SignatureThresholdsVarianceSampleBlockIdDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  SignatureThresholdsVarianceSampleCurrentAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_CURRENT_ASC',
  SignatureThresholdsVarianceSampleCurrentDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_CURRENT_DESC',
  SignatureThresholdsVarianceSampleIdAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_ID_ASC',
  SignatureThresholdsVarianceSampleIdDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_ID_DESC',
  SignatureThresholdsVarianceSampleNextAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_NEXT_ASC',
  SignatureThresholdsVarianceSampleNextDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_NEXT_DESC',
  SignatureThresholdsVarianceSamplePendingAsc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_PENDING_ASC',
  SignatureThresholdsVarianceSamplePendingDesc = 'SIGNATURE_THRESHOLDS_VARIANCE_SAMPLE_PENDING_DESC',
  SpecVersionAsc = 'SPEC_VERSION_ASC',
  SpecVersionDesc = 'SPEC_VERSION_DESC',
  StateRootAsc = 'STATE_ROOT_ASC',
  StateRootDesc = 'STATE_ROOT_DESC',
  TimestampAsc = 'TIMESTAMP_ASC',
  TimestampDesc = 'TIMESTAMP_DESC',
}

/** A filter to be used against Boolean fields. All fields are combined with a logical ‘and.’ */
export type BooleanFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Boolean']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Boolean']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Boolean']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Boolean']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Boolean']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Boolean']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Boolean']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Boolean']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Boolean']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Boolean']>>;
};

/** A filter to be used against Datetime fields. All fields are combined with a logical ‘and.’ */
export type DatetimeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Datetime']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Datetime']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Datetime']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Datetime']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Datetime']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Datetime']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Datetime']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Datetime']>>;
};

export type Event = Node & {
  __typename?: 'Event';
  arguments?: Maybe<Scalars['String']>;
  /** Reads a single `Block` that is related to this `Event`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  blockNumber: Scalars['BigFloat'];
  data?: Maybe<Scalars['String']>;
  docs?: Maybe<Scalars['String']>;
  /** Reads a single `Extrinsic` that is related to this `Event`. */
  extrinsic?: Maybe<Extrinsic>;
  extrinsicId?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  index: Scalars['Int'];
  method?: Maybe<Scalars['String']>;
  module?: Maybe<Scalars['String']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  timestamp?: Maybe<Scalars['Datetime']>;
};

export type EventAggregates = {
  __typename?: 'EventAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<EventAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<EventDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<EventMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<EventMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<EventStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<EventStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<EventSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<EventVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<EventVarianceSampleAggregates>;
};

export type EventAverageAggregates = {
  __typename?: 'EventAverageAggregates';
  /** Mean average of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Mean average of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

export type EventDistinctCountAggregates = {
  __typename?: 'EventDistinctCountAggregates';
  /** Distinct count of arguments across the matching connection */
  arguments?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of data across the matching connection */
  data?: Maybe<Scalars['BigInt']>;
  /** Distinct count of docs across the matching connection */
  docs?: Maybe<Scalars['BigInt']>;
  /** Distinct count of extrinsicId across the matching connection */
  extrinsicId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of index across the matching connection */
  index?: Maybe<Scalars['BigInt']>;
  /** Distinct count of method across the matching connection */
  method?: Maybe<Scalars['BigInt']>;
  /** Distinct count of module across the matching connection */
  module?: Maybe<Scalars['BigInt']>;
  /** Distinct count of timestamp across the matching connection */
  timestamp?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Event` object types. All fields are combined with a logical ‘and.’ */
export type EventFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<EventFilter>>;
  /** Filter by the object’s `arguments` field. */
  arguments?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `data` field. */
  data?: InputMaybe<StringFilter>;
  /** Filter by the object’s `docs` field. */
  docs?: InputMaybe<StringFilter>;
  /** Filter by the object’s `extrinsicId` field. */
  extrinsicId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `index` field. */
  index?: InputMaybe<IntFilter>;
  /** Filter by the object’s `method` field. */
  method?: InputMaybe<StringFilter>;
  /** Filter by the object’s `module` field. */
  module?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<EventFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<EventFilter>>;
  /** Filter by the object’s `timestamp` field. */
  timestamp?: InputMaybe<DatetimeFilter>;
};

export type EventMaxAggregates = {
  __typename?: 'EventMaxAggregates';
  /** Maximum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Maximum of index across the matching connection */
  index?: Maybe<Scalars['Int']>;
};

export type EventMinAggregates = {
  __typename?: 'EventMinAggregates';
  /** Minimum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Minimum of index across the matching connection */
  index?: Maybe<Scalars['Int']>;
};

export type EventStddevPopulationAggregates = {
  __typename?: 'EventStddevPopulationAggregates';
  /** Population standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

export type EventStddevSampleAggregates = {
  __typename?: 'EventStddevSampleAggregates';
  /** Sample standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

export type EventSumAggregates = {
  __typename?: 'EventSumAggregates';
  /** Sum of blockNumber across the matching connection */
  blockNumber: Scalars['BigFloat'];
  /** Sum of index across the matching connection */
  index: Scalars['BigInt'];
};

export type EventVariancePopulationAggregates = {
  __typename?: 'EventVariancePopulationAggregates';
  /** Population variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population variance of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

export type EventVarianceSampleAggregates = {
  __typename?: 'EventVarianceSampleAggregates';
  /** Sample variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `Event` values. */
export type EventsConnection = {
  __typename?: 'EventsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<EventAggregates>;
  /** A list of edges which contains the `Event` and cursor to aid in pagination. */
  edges: Array<EventsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<EventAggregates>>;
  /** A list of `Event` objects. */
  nodes: Array<Maybe<Event>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Event` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Event` values. */
export type EventsConnectionGroupedAggregatesArgs = {
  groupBy: Array<EventsGroupBy>;
  having?: InputMaybe<EventsHavingInput>;
};

/** A `Event` edge in the connection. */
export type EventsEdge = {
  __typename?: 'EventsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Event` at the end of the edge. */
  node?: Maybe<Event>;
};

/** Grouping methods for `Event` for usage during aggregation. */
export enum EventsGroupBy {
  Arguments = 'ARGUMENTS',
  BlockId = 'BLOCK_ID',
  BlockNumber = 'BLOCK_NUMBER',
  Data = 'DATA',
  Docs = 'DOCS',
  ExtrinsicId = 'EXTRINSIC_ID',
  Index = 'INDEX',
  Method = 'METHOD',
  Module = 'MODULE',
  Timestamp = 'TIMESTAMP',
  TimestampTruncatedToDay = 'TIMESTAMP_TRUNCATED_TO_DAY',
  TimestampTruncatedToHour = 'TIMESTAMP_TRUNCATED_TO_HOUR',
}

export type EventsHavingAverageInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type EventsHavingDistinctCountInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

/** Conditions for `Event` aggregates. */
export type EventsHavingInput = {
  AND?: InputMaybe<Array<EventsHavingInput>>;
  OR?: InputMaybe<Array<EventsHavingInput>>;
  average?: InputMaybe<EventsHavingAverageInput>;
  distinctCount?: InputMaybe<EventsHavingDistinctCountInput>;
  max?: InputMaybe<EventsHavingMaxInput>;
  min?: InputMaybe<EventsHavingMinInput>;
  stddevPopulation?: InputMaybe<EventsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<EventsHavingStddevSampleInput>;
  sum?: InputMaybe<EventsHavingSumInput>;
  variancePopulation?: InputMaybe<EventsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<EventsHavingVarianceSampleInput>;
};

export type EventsHavingMaxInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type EventsHavingMinInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type EventsHavingStddevPopulationInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type EventsHavingStddevSampleInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type EventsHavingSumInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type EventsHavingVariancePopulationInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

export type EventsHavingVarianceSampleInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
  timestamp?: InputMaybe<HavingDatetimeFilter>;
};

/** Methods to use when ordering `Event`. */
export enum EventsOrderBy {
  ArgumentsAsc = 'ARGUMENTS_ASC',
  ArgumentsDesc = 'ARGUMENTS_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  DocsAsc = 'DOCS_ASC',
  DocsDesc = 'DOCS_DESC',
  ExtrinsicIdAsc = 'EXTRINSIC_ID_ASC',
  ExtrinsicIdDesc = 'EXTRINSIC_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IndexAsc = 'INDEX_ASC',
  IndexDesc = 'INDEX_DESC',
  MethodAsc = 'METHOD_ASC',
  MethodDesc = 'METHOD_DESC',
  ModuleAsc = 'MODULE_ASC',
  ModuleDesc = 'MODULE_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  TimestampAsc = 'TIMESTAMP_ASC',
  TimestampDesc = 'TIMESTAMP_DESC',
}

export type Extrinsic = Node & {
  __typename?: 'Extrinsic';
  arguments?: Maybe<Scalars['String']>;
  /** Reads a single `Block` that is related to this `Extrinsic`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  blockNumber: Scalars['BigFloat'];
  /** Reads and enables pagination through a set of `Block`. */
  blocksByEventExtrinsicIdAndBlockId: ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Event`. */
  events: EventsConnection;
  hash: Scalars['String'];
  id: Scalars['String'];
  index: Scalars['Int'];
  isSigned?: Maybe<Scalars['Boolean']>;
  isSuccess?: Maybe<Scalars['Boolean']>;
  method?: Maybe<Scalars['String']>;
  module?: Maybe<Scalars['String']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads a single `Account` that is related to this `Extrinsic`. */
  signer?: Maybe<Account>;
  signerId?: Maybe<Scalars['String']>;
};

export type ExtrinsicBlocksByEventExtrinsicIdAndBlockIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<BlockFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<BlocksOrderBy>>;
};

export type ExtrinsicEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<EventFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};

export type ExtrinsicAggregates = {
  __typename?: 'ExtrinsicAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<ExtrinsicAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<ExtrinsicDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<ExtrinsicMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<ExtrinsicMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<ExtrinsicStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<ExtrinsicStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<ExtrinsicSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<ExtrinsicVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<ExtrinsicVarianceSampleAggregates>;
};

export type ExtrinsicAverageAggregates = {
  __typename?: 'ExtrinsicAverageAggregates';
  /** Mean average of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Mean average of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `Block` values, with data from `Event`. */
export type ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyConnection = {
  __typename?: 'ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** A list of edges which contains the `Block`, info from the `Event`, and the cursor to aid in pagination. */
  edges: Array<ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Block` values, with data from `Event`. */
export type ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: InputMaybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection, with data from `Event`. */
export type ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyEdge = {
  __typename?: 'ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** Reads and enables pagination through a set of `Event`. */
  events: EventsConnection;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
};

/** A `Block` edge in the connection, with data from `Event`. */
export type ExtrinsicBlocksByEventExtrinsicIdAndBlockIdManyToManyEdgeEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<EventFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};

export type ExtrinsicDistinctCountAggregates = {
  __typename?: 'ExtrinsicDistinctCountAggregates';
  /** Distinct count of arguments across the matching connection */
  arguments?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of hash across the matching connection */
  hash?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of index across the matching connection */
  index?: Maybe<Scalars['BigInt']>;
  /** Distinct count of isSigned across the matching connection */
  isSigned?: Maybe<Scalars['BigInt']>;
  /** Distinct count of isSuccess across the matching connection */
  isSuccess?: Maybe<Scalars['BigInt']>;
  /** Distinct count of method across the matching connection */
  method?: Maybe<Scalars['BigInt']>;
  /** Distinct count of module across the matching connection */
  module?: Maybe<Scalars['BigInt']>;
  /** Distinct count of signerId across the matching connection */
  signerId?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Extrinsic` object types. All fields are combined with a logical ‘and.’ */
export type ExtrinsicFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ExtrinsicFilter>>;
  /** Filter by the object’s `arguments` field. */
  arguments?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<BigFloatFilter>;
  /** Filter by the object’s `hash` field. */
  hash?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `index` field. */
  index?: InputMaybe<IntFilter>;
  /** Filter by the object’s `isSigned` field. */
  isSigned?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isSuccess` field. */
  isSuccess?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `method` field. */
  method?: InputMaybe<StringFilter>;
  /** Filter by the object’s `module` field. */
  module?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ExtrinsicFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ExtrinsicFilter>>;
  /** Filter by the object’s `signerId` field. */
  signerId?: InputMaybe<StringFilter>;
};

export type ExtrinsicMaxAggregates = {
  __typename?: 'ExtrinsicMaxAggregates';
  /** Maximum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Maximum of index across the matching connection */
  index?: Maybe<Scalars['Int']>;
};

export type ExtrinsicMinAggregates = {
  __typename?: 'ExtrinsicMinAggregates';
  /** Minimum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Minimum of index across the matching connection */
  index?: Maybe<Scalars['Int']>;
};

export type ExtrinsicStddevPopulationAggregates = {
  __typename?: 'ExtrinsicStddevPopulationAggregates';
  /** Population standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

export type ExtrinsicStddevSampleAggregates = {
  __typename?: 'ExtrinsicStddevSampleAggregates';
  /** Sample standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

export type ExtrinsicSumAggregates = {
  __typename?: 'ExtrinsicSumAggregates';
  /** Sum of blockNumber across the matching connection */
  blockNumber: Scalars['BigFloat'];
  /** Sum of index across the matching connection */
  index: Scalars['BigInt'];
};

export type ExtrinsicVariancePopulationAggregates = {
  __typename?: 'ExtrinsicVariancePopulationAggregates';
  /** Population variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population variance of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

export type ExtrinsicVarianceSampleAggregates = {
  __typename?: 'ExtrinsicVarianceSampleAggregates';
  /** Sample variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of index across the matching connection */
  index?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `Extrinsic` values. */
export type ExtrinsicsConnection = {
  __typename?: 'ExtrinsicsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ExtrinsicAggregates>;
  /** A list of edges which contains the `Extrinsic` and cursor to aid in pagination. */
  edges: Array<ExtrinsicsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ExtrinsicAggregates>>;
  /** A list of `Extrinsic` objects. */
  nodes: Array<Maybe<Extrinsic>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Extrinsic` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Extrinsic` values. */
export type ExtrinsicsConnectionGroupedAggregatesArgs = {
  groupBy: Array<ExtrinsicsGroupBy>;
  having?: InputMaybe<ExtrinsicsHavingInput>;
};

/** A `Extrinsic` edge in the connection. */
export type ExtrinsicsEdge = {
  __typename?: 'ExtrinsicsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Extrinsic` at the end of the edge. */
  node?: Maybe<Extrinsic>;
};

/** Grouping methods for `Extrinsic` for usage during aggregation. */
export enum ExtrinsicsGroupBy {
  Arguments = 'ARGUMENTS',
  BlockId = 'BLOCK_ID',
  BlockNumber = 'BLOCK_NUMBER',
  Hash = 'HASH',
  Index = 'INDEX',
  IsSigned = 'IS_SIGNED',
  IsSuccess = 'IS_SUCCESS',
  Method = 'METHOD',
  Module = 'MODULE',
  SignerId = 'SIGNER_ID',
}

export type ExtrinsicsHavingAverageInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

export type ExtrinsicsHavingDistinctCountInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `Extrinsic` aggregates. */
export type ExtrinsicsHavingInput = {
  AND?: InputMaybe<Array<ExtrinsicsHavingInput>>;
  OR?: InputMaybe<Array<ExtrinsicsHavingInput>>;
  average?: InputMaybe<ExtrinsicsHavingAverageInput>;
  distinctCount?: InputMaybe<ExtrinsicsHavingDistinctCountInput>;
  max?: InputMaybe<ExtrinsicsHavingMaxInput>;
  min?: InputMaybe<ExtrinsicsHavingMinInput>;
  stddevPopulation?: InputMaybe<ExtrinsicsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<ExtrinsicsHavingStddevSampleInput>;
  sum?: InputMaybe<ExtrinsicsHavingSumInput>;
  variancePopulation?: InputMaybe<ExtrinsicsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<ExtrinsicsHavingVarianceSampleInput>;
};

export type ExtrinsicsHavingMaxInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

export type ExtrinsicsHavingMinInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

export type ExtrinsicsHavingStddevPopulationInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

export type ExtrinsicsHavingStddevSampleInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

export type ExtrinsicsHavingSumInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

export type ExtrinsicsHavingVariancePopulationInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

export type ExtrinsicsHavingVarianceSampleInput = {
  blockNumber?: InputMaybe<HavingBigfloatFilter>;
  index?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `Extrinsic`. */
export enum ExtrinsicsOrderBy {
  ArgumentsAsc = 'ARGUMENTS_ASC',
  ArgumentsDesc = 'ARGUMENTS_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  EventsAverageArgumentsAsc = 'EVENTS_AVERAGE_ARGUMENTS_ASC',
  EventsAverageArgumentsDesc = 'EVENTS_AVERAGE_ARGUMENTS_DESC',
  EventsAverageBlockIdAsc = 'EVENTS_AVERAGE_BLOCK_ID_ASC',
  EventsAverageBlockIdDesc = 'EVENTS_AVERAGE_BLOCK_ID_DESC',
  EventsAverageBlockNumberAsc = 'EVENTS_AVERAGE_BLOCK_NUMBER_ASC',
  EventsAverageBlockNumberDesc = 'EVENTS_AVERAGE_BLOCK_NUMBER_DESC',
  EventsAverageDataAsc = 'EVENTS_AVERAGE_DATA_ASC',
  EventsAverageDataDesc = 'EVENTS_AVERAGE_DATA_DESC',
  EventsAverageDocsAsc = 'EVENTS_AVERAGE_DOCS_ASC',
  EventsAverageDocsDesc = 'EVENTS_AVERAGE_DOCS_DESC',
  EventsAverageExtrinsicIdAsc = 'EVENTS_AVERAGE_EXTRINSIC_ID_ASC',
  EventsAverageExtrinsicIdDesc = 'EVENTS_AVERAGE_EXTRINSIC_ID_DESC',
  EventsAverageIdAsc = 'EVENTS_AVERAGE_ID_ASC',
  EventsAverageIdDesc = 'EVENTS_AVERAGE_ID_DESC',
  EventsAverageIndexAsc = 'EVENTS_AVERAGE_INDEX_ASC',
  EventsAverageIndexDesc = 'EVENTS_AVERAGE_INDEX_DESC',
  EventsAverageMethodAsc = 'EVENTS_AVERAGE_METHOD_ASC',
  EventsAverageMethodDesc = 'EVENTS_AVERAGE_METHOD_DESC',
  EventsAverageModuleAsc = 'EVENTS_AVERAGE_MODULE_ASC',
  EventsAverageModuleDesc = 'EVENTS_AVERAGE_MODULE_DESC',
  EventsAverageTimestampAsc = 'EVENTS_AVERAGE_TIMESTAMP_ASC',
  EventsAverageTimestampDesc = 'EVENTS_AVERAGE_TIMESTAMP_DESC',
  EventsCountAsc = 'EVENTS_COUNT_ASC',
  EventsCountDesc = 'EVENTS_COUNT_DESC',
  EventsDistinctCountArgumentsAsc = 'EVENTS_DISTINCT_COUNT_ARGUMENTS_ASC',
  EventsDistinctCountArgumentsDesc = 'EVENTS_DISTINCT_COUNT_ARGUMENTS_DESC',
  EventsDistinctCountBlockIdAsc = 'EVENTS_DISTINCT_COUNT_BLOCK_ID_ASC',
  EventsDistinctCountBlockIdDesc = 'EVENTS_DISTINCT_COUNT_BLOCK_ID_DESC',
  EventsDistinctCountBlockNumberAsc = 'EVENTS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  EventsDistinctCountBlockNumberDesc = 'EVENTS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  EventsDistinctCountDataAsc = 'EVENTS_DISTINCT_COUNT_DATA_ASC',
  EventsDistinctCountDataDesc = 'EVENTS_DISTINCT_COUNT_DATA_DESC',
  EventsDistinctCountDocsAsc = 'EVENTS_DISTINCT_COUNT_DOCS_ASC',
  EventsDistinctCountDocsDesc = 'EVENTS_DISTINCT_COUNT_DOCS_DESC',
  EventsDistinctCountExtrinsicIdAsc = 'EVENTS_DISTINCT_COUNT_EXTRINSIC_ID_ASC',
  EventsDistinctCountExtrinsicIdDesc = 'EVENTS_DISTINCT_COUNT_EXTRINSIC_ID_DESC',
  EventsDistinctCountIdAsc = 'EVENTS_DISTINCT_COUNT_ID_ASC',
  EventsDistinctCountIdDesc = 'EVENTS_DISTINCT_COUNT_ID_DESC',
  EventsDistinctCountIndexAsc = 'EVENTS_DISTINCT_COUNT_INDEX_ASC',
  EventsDistinctCountIndexDesc = 'EVENTS_DISTINCT_COUNT_INDEX_DESC',
  EventsDistinctCountMethodAsc = 'EVENTS_DISTINCT_COUNT_METHOD_ASC',
  EventsDistinctCountMethodDesc = 'EVENTS_DISTINCT_COUNT_METHOD_DESC',
  EventsDistinctCountModuleAsc = 'EVENTS_DISTINCT_COUNT_MODULE_ASC',
  EventsDistinctCountModuleDesc = 'EVENTS_DISTINCT_COUNT_MODULE_DESC',
  EventsDistinctCountTimestampAsc = 'EVENTS_DISTINCT_COUNT_TIMESTAMP_ASC',
  EventsDistinctCountTimestampDesc = 'EVENTS_DISTINCT_COUNT_TIMESTAMP_DESC',
  EventsMaxArgumentsAsc = 'EVENTS_MAX_ARGUMENTS_ASC',
  EventsMaxArgumentsDesc = 'EVENTS_MAX_ARGUMENTS_DESC',
  EventsMaxBlockIdAsc = 'EVENTS_MAX_BLOCK_ID_ASC',
  EventsMaxBlockIdDesc = 'EVENTS_MAX_BLOCK_ID_DESC',
  EventsMaxBlockNumberAsc = 'EVENTS_MAX_BLOCK_NUMBER_ASC',
  EventsMaxBlockNumberDesc = 'EVENTS_MAX_BLOCK_NUMBER_DESC',
  EventsMaxDataAsc = 'EVENTS_MAX_DATA_ASC',
  EventsMaxDataDesc = 'EVENTS_MAX_DATA_DESC',
  EventsMaxDocsAsc = 'EVENTS_MAX_DOCS_ASC',
  EventsMaxDocsDesc = 'EVENTS_MAX_DOCS_DESC',
  EventsMaxExtrinsicIdAsc = 'EVENTS_MAX_EXTRINSIC_ID_ASC',
  EventsMaxExtrinsicIdDesc = 'EVENTS_MAX_EXTRINSIC_ID_DESC',
  EventsMaxIdAsc = 'EVENTS_MAX_ID_ASC',
  EventsMaxIdDesc = 'EVENTS_MAX_ID_DESC',
  EventsMaxIndexAsc = 'EVENTS_MAX_INDEX_ASC',
  EventsMaxIndexDesc = 'EVENTS_MAX_INDEX_DESC',
  EventsMaxMethodAsc = 'EVENTS_MAX_METHOD_ASC',
  EventsMaxMethodDesc = 'EVENTS_MAX_METHOD_DESC',
  EventsMaxModuleAsc = 'EVENTS_MAX_MODULE_ASC',
  EventsMaxModuleDesc = 'EVENTS_MAX_MODULE_DESC',
  EventsMaxTimestampAsc = 'EVENTS_MAX_TIMESTAMP_ASC',
  EventsMaxTimestampDesc = 'EVENTS_MAX_TIMESTAMP_DESC',
  EventsMinArgumentsAsc = 'EVENTS_MIN_ARGUMENTS_ASC',
  EventsMinArgumentsDesc = 'EVENTS_MIN_ARGUMENTS_DESC',
  EventsMinBlockIdAsc = 'EVENTS_MIN_BLOCK_ID_ASC',
  EventsMinBlockIdDesc = 'EVENTS_MIN_BLOCK_ID_DESC',
  EventsMinBlockNumberAsc = 'EVENTS_MIN_BLOCK_NUMBER_ASC',
  EventsMinBlockNumberDesc = 'EVENTS_MIN_BLOCK_NUMBER_DESC',
  EventsMinDataAsc = 'EVENTS_MIN_DATA_ASC',
  EventsMinDataDesc = 'EVENTS_MIN_DATA_DESC',
  EventsMinDocsAsc = 'EVENTS_MIN_DOCS_ASC',
  EventsMinDocsDesc = 'EVENTS_MIN_DOCS_DESC',
  EventsMinExtrinsicIdAsc = 'EVENTS_MIN_EXTRINSIC_ID_ASC',
  EventsMinExtrinsicIdDesc = 'EVENTS_MIN_EXTRINSIC_ID_DESC',
  EventsMinIdAsc = 'EVENTS_MIN_ID_ASC',
  EventsMinIdDesc = 'EVENTS_MIN_ID_DESC',
  EventsMinIndexAsc = 'EVENTS_MIN_INDEX_ASC',
  EventsMinIndexDesc = 'EVENTS_MIN_INDEX_DESC',
  EventsMinMethodAsc = 'EVENTS_MIN_METHOD_ASC',
  EventsMinMethodDesc = 'EVENTS_MIN_METHOD_DESC',
  EventsMinModuleAsc = 'EVENTS_MIN_MODULE_ASC',
  EventsMinModuleDesc = 'EVENTS_MIN_MODULE_DESC',
  EventsMinTimestampAsc = 'EVENTS_MIN_TIMESTAMP_ASC',
  EventsMinTimestampDesc = 'EVENTS_MIN_TIMESTAMP_DESC',
  EventsStddevPopulationArgumentsAsc = 'EVENTS_STDDEV_POPULATION_ARGUMENTS_ASC',
  EventsStddevPopulationArgumentsDesc = 'EVENTS_STDDEV_POPULATION_ARGUMENTS_DESC',
  EventsStddevPopulationBlockIdAsc = 'EVENTS_STDDEV_POPULATION_BLOCK_ID_ASC',
  EventsStddevPopulationBlockIdDesc = 'EVENTS_STDDEV_POPULATION_BLOCK_ID_DESC',
  EventsStddevPopulationBlockNumberAsc = 'EVENTS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  EventsStddevPopulationBlockNumberDesc = 'EVENTS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  EventsStddevPopulationDataAsc = 'EVENTS_STDDEV_POPULATION_DATA_ASC',
  EventsStddevPopulationDataDesc = 'EVENTS_STDDEV_POPULATION_DATA_DESC',
  EventsStddevPopulationDocsAsc = 'EVENTS_STDDEV_POPULATION_DOCS_ASC',
  EventsStddevPopulationDocsDesc = 'EVENTS_STDDEV_POPULATION_DOCS_DESC',
  EventsStddevPopulationExtrinsicIdAsc = 'EVENTS_STDDEV_POPULATION_EXTRINSIC_ID_ASC',
  EventsStddevPopulationExtrinsicIdDesc = 'EVENTS_STDDEV_POPULATION_EXTRINSIC_ID_DESC',
  EventsStddevPopulationIdAsc = 'EVENTS_STDDEV_POPULATION_ID_ASC',
  EventsStddevPopulationIdDesc = 'EVENTS_STDDEV_POPULATION_ID_DESC',
  EventsStddevPopulationIndexAsc = 'EVENTS_STDDEV_POPULATION_INDEX_ASC',
  EventsStddevPopulationIndexDesc = 'EVENTS_STDDEV_POPULATION_INDEX_DESC',
  EventsStddevPopulationMethodAsc = 'EVENTS_STDDEV_POPULATION_METHOD_ASC',
  EventsStddevPopulationMethodDesc = 'EVENTS_STDDEV_POPULATION_METHOD_DESC',
  EventsStddevPopulationModuleAsc = 'EVENTS_STDDEV_POPULATION_MODULE_ASC',
  EventsStddevPopulationModuleDesc = 'EVENTS_STDDEV_POPULATION_MODULE_DESC',
  EventsStddevPopulationTimestampAsc = 'EVENTS_STDDEV_POPULATION_TIMESTAMP_ASC',
  EventsStddevPopulationTimestampDesc = 'EVENTS_STDDEV_POPULATION_TIMESTAMP_DESC',
  EventsStddevSampleArgumentsAsc = 'EVENTS_STDDEV_SAMPLE_ARGUMENTS_ASC',
  EventsStddevSampleArgumentsDesc = 'EVENTS_STDDEV_SAMPLE_ARGUMENTS_DESC',
  EventsStddevSampleBlockIdAsc = 'EVENTS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  EventsStddevSampleBlockIdDesc = 'EVENTS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  EventsStddevSampleBlockNumberAsc = 'EVENTS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  EventsStddevSampleBlockNumberDesc = 'EVENTS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  EventsStddevSampleDataAsc = 'EVENTS_STDDEV_SAMPLE_DATA_ASC',
  EventsStddevSampleDataDesc = 'EVENTS_STDDEV_SAMPLE_DATA_DESC',
  EventsStddevSampleDocsAsc = 'EVENTS_STDDEV_SAMPLE_DOCS_ASC',
  EventsStddevSampleDocsDesc = 'EVENTS_STDDEV_SAMPLE_DOCS_DESC',
  EventsStddevSampleExtrinsicIdAsc = 'EVENTS_STDDEV_SAMPLE_EXTRINSIC_ID_ASC',
  EventsStddevSampleExtrinsicIdDesc = 'EVENTS_STDDEV_SAMPLE_EXTRINSIC_ID_DESC',
  EventsStddevSampleIdAsc = 'EVENTS_STDDEV_SAMPLE_ID_ASC',
  EventsStddevSampleIdDesc = 'EVENTS_STDDEV_SAMPLE_ID_DESC',
  EventsStddevSampleIndexAsc = 'EVENTS_STDDEV_SAMPLE_INDEX_ASC',
  EventsStddevSampleIndexDesc = 'EVENTS_STDDEV_SAMPLE_INDEX_DESC',
  EventsStddevSampleMethodAsc = 'EVENTS_STDDEV_SAMPLE_METHOD_ASC',
  EventsStddevSampleMethodDesc = 'EVENTS_STDDEV_SAMPLE_METHOD_DESC',
  EventsStddevSampleModuleAsc = 'EVENTS_STDDEV_SAMPLE_MODULE_ASC',
  EventsStddevSampleModuleDesc = 'EVENTS_STDDEV_SAMPLE_MODULE_DESC',
  EventsStddevSampleTimestampAsc = 'EVENTS_STDDEV_SAMPLE_TIMESTAMP_ASC',
  EventsStddevSampleTimestampDesc = 'EVENTS_STDDEV_SAMPLE_TIMESTAMP_DESC',
  EventsSumArgumentsAsc = 'EVENTS_SUM_ARGUMENTS_ASC',
  EventsSumArgumentsDesc = 'EVENTS_SUM_ARGUMENTS_DESC',
  EventsSumBlockIdAsc = 'EVENTS_SUM_BLOCK_ID_ASC',
  EventsSumBlockIdDesc = 'EVENTS_SUM_BLOCK_ID_DESC',
  EventsSumBlockNumberAsc = 'EVENTS_SUM_BLOCK_NUMBER_ASC',
  EventsSumBlockNumberDesc = 'EVENTS_SUM_BLOCK_NUMBER_DESC',
  EventsSumDataAsc = 'EVENTS_SUM_DATA_ASC',
  EventsSumDataDesc = 'EVENTS_SUM_DATA_DESC',
  EventsSumDocsAsc = 'EVENTS_SUM_DOCS_ASC',
  EventsSumDocsDesc = 'EVENTS_SUM_DOCS_DESC',
  EventsSumExtrinsicIdAsc = 'EVENTS_SUM_EXTRINSIC_ID_ASC',
  EventsSumExtrinsicIdDesc = 'EVENTS_SUM_EXTRINSIC_ID_DESC',
  EventsSumIdAsc = 'EVENTS_SUM_ID_ASC',
  EventsSumIdDesc = 'EVENTS_SUM_ID_DESC',
  EventsSumIndexAsc = 'EVENTS_SUM_INDEX_ASC',
  EventsSumIndexDesc = 'EVENTS_SUM_INDEX_DESC',
  EventsSumMethodAsc = 'EVENTS_SUM_METHOD_ASC',
  EventsSumMethodDesc = 'EVENTS_SUM_METHOD_DESC',
  EventsSumModuleAsc = 'EVENTS_SUM_MODULE_ASC',
  EventsSumModuleDesc = 'EVENTS_SUM_MODULE_DESC',
  EventsSumTimestampAsc = 'EVENTS_SUM_TIMESTAMP_ASC',
  EventsSumTimestampDesc = 'EVENTS_SUM_TIMESTAMP_DESC',
  EventsVariancePopulationArgumentsAsc = 'EVENTS_VARIANCE_POPULATION_ARGUMENTS_ASC',
  EventsVariancePopulationArgumentsDesc = 'EVENTS_VARIANCE_POPULATION_ARGUMENTS_DESC',
  EventsVariancePopulationBlockIdAsc = 'EVENTS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  EventsVariancePopulationBlockIdDesc = 'EVENTS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  EventsVariancePopulationBlockNumberAsc = 'EVENTS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  EventsVariancePopulationBlockNumberDesc = 'EVENTS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  EventsVariancePopulationDataAsc = 'EVENTS_VARIANCE_POPULATION_DATA_ASC',
  EventsVariancePopulationDataDesc = 'EVENTS_VARIANCE_POPULATION_DATA_DESC',
  EventsVariancePopulationDocsAsc = 'EVENTS_VARIANCE_POPULATION_DOCS_ASC',
  EventsVariancePopulationDocsDesc = 'EVENTS_VARIANCE_POPULATION_DOCS_DESC',
  EventsVariancePopulationExtrinsicIdAsc = 'EVENTS_VARIANCE_POPULATION_EXTRINSIC_ID_ASC',
  EventsVariancePopulationExtrinsicIdDesc = 'EVENTS_VARIANCE_POPULATION_EXTRINSIC_ID_DESC',
  EventsVariancePopulationIdAsc = 'EVENTS_VARIANCE_POPULATION_ID_ASC',
  EventsVariancePopulationIdDesc = 'EVENTS_VARIANCE_POPULATION_ID_DESC',
  EventsVariancePopulationIndexAsc = 'EVENTS_VARIANCE_POPULATION_INDEX_ASC',
  EventsVariancePopulationIndexDesc = 'EVENTS_VARIANCE_POPULATION_INDEX_DESC',
  EventsVariancePopulationMethodAsc = 'EVENTS_VARIANCE_POPULATION_METHOD_ASC',
  EventsVariancePopulationMethodDesc = 'EVENTS_VARIANCE_POPULATION_METHOD_DESC',
  EventsVariancePopulationModuleAsc = 'EVENTS_VARIANCE_POPULATION_MODULE_ASC',
  EventsVariancePopulationModuleDesc = 'EVENTS_VARIANCE_POPULATION_MODULE_DESC',
  EventsVariancePopulationTimestampAsc = 'EVENTS_VARIANCE_POPULATION_TIMESTAMP_ASC',
  EventsVariancePopulationTimestampDesc = 'EVENTS_VARIANCE_POPULATION_TIMESTAMP_DESC',
  EventsVarianceSampleArgumentsAsc = 'EVENTS_VARIANCE_SAMPLE_ARGUMENTS_ASC',
  EventsVarianceSampleArgumentsDesc = 'EVENTS_VARIANCE_SAMPLE_ARGUMENTS_DESC',
  EventsVarianceSampleBlockIdAsc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  EventsVarianceSampleBlockIdDesc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  EventsVarianceSampleBlockNumberAsc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  EventsVarianceSampleBlockNumberDesc = 'EVENTS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  EventsVarianceSampleDataAsc = 'EVENTS_VARIANCE_SAMPLE_DATA_ASC',
  EventsVarianceSampleDataDesc = 'EVENTS_VARIANCE_SAMPLE_DATA_DESC',
  EventsVarianceSampleDocsAsc = 'EVENTS_VARIANCE_SAMPLE_DOCS_ASC',
  EventsVarianceSampleDocsDesc = 'EVENTS_VARIANCE_SAMPLE_DOCS_DESC',
  EventsVarianceSampleExtrinsicIdAsc = 'EVENTS_VARIANCE_SAMPLE_EXTRINSIC_ID_ASC',
  EventsVarianceSampleExtrinsicIdDesc = 'EVENTS_VARIANCE_SAMPLE_EXTRINSIC_ID_DESC',
  EventsVarianceSampleIdAsc = 'EVENTS_VARIANCE_SAMPLE_ID_ASC',
  EventsVarianceSampleIdDesc = 'EVENTS_VARIANCE_SAMPLE_ID_DESC',
  EventsVarianceSampleIndexAsc = 'EVENTS_VARIANCE_SAMPLE_INDEX_ASC',
  EventsVarianceSampleIndexDesc = 'EVENTS_VARIANCE_SAMPLE_INDEX_DESC',
  EventsVarianceSampleMethodAsc = 'EVENTS_VARIANCE_SAMPLE_METHOD_ASC',
  EventsVarianceSampleMethodDesc = 'EVENTS_VARIANCE_SAMPLE_METHOD_DESC',
  EventsVarianceSampleModuleAsc = 'EVENTS_VARIANCE_SAMPLE_MODULE_ASC',
  EventsVarianceSampleModuleDesc = 'EVENTS_VARIANCE_SAMPLE_MODULE_DESC',
  EventsVarianceSampleTimestampAsc = 'EVENTS_VARIANCE_SAMPLE_TIMESTAMP_ASC',
  EventsVarianceSampleTimestampDesc = 'EVENTS_VARIANCE_SAMPLE_TIMESTAMP_DESC',
  HashAsc = 'HASH_ASC',
  HashDesc = 'HASH_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IndexAsc = 'INDEX_ASC',
  IndexDesc = 'INDEX_DESC',
  IsSignedAsc = 'IS_SIGNED_ASC',
  IsSignedDesc = 'IS_SIGNED_DESC',
  IsSuccessAsc = 'IS_SUCCESS_ASC',
  IsSuccessDesc = 'IS_SUCCESS_DESC',
  MethodAsc = 'METHOD_ASC',
  MethodDesc = 'METHOD_DESC',
  ModuleAsc = 'MODULE_ASC',
  ModuleDesc = 'MODULE_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignerIdAsc = 'SIGNER_ID_ASC',
  SignerIdDesc = 'SIGNER_ID_DESC',
}

export type HavingBigfloatFilter = {
  equalTo?: InputMaybe<Scalars['BigFloat']>;
  greaterThan?: InputMaybe<Scalars['BigFloat']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['BigFloat']>;
  lessThan?: InputMaybe<Scalars['BigFloat']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['BigFloat']>;
  notEqualTo?: InputMaybe<Scalars['BigFloat']>;
};

export type HavingDatetimeFilter = {
  equalTo?: InputMaybe<Scalars['Datetime']>;
  greaterThan?: InputMaybe<Scalars['Datetime']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Datetime']>;
  lessThan?: InputMaybe<Scalars['Datetime']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Datetime']>;
  notEqualTo?: InputMaybe<Scalars['Datetime']>;
};

export type HavingIntFilter = {
  equalTo?: InputMaybe<Scalars['Int']>;
  greaterThan?: InputMaybe<Scalars['Int']>;
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']>;
  lessThan?: InputMaybe<Scalars['Int']>;
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']>;
  notEqualTo?: InputMaybe<Scalars['Int']>;
};

/** A filter to be used against Int fields. All fields are combined with a logical ‘and.’ */
export type IntFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['Int']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['Int']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['Int']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['Int']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['Int']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['Int']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['Int']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['Int']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['Int']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['Int']>>;
};

/** A filter to be used against JSON fields. All fields are combined with a logical ‘and.’ */
export type JsonFilter = {
  /** Contained by the specified JSON. */
  containedBy?: InputMaybe<Scalars['JSON']>;
  /** Contains the specified JSON. */
  contains?: InputMaybe<Scalars['JSON']>;
  /** Contains all of the specified keys. */
  containsAllKeys?: InputMaybe<Array<Scalars['String']>>;
  /** Contains any of the specified keys. */
  containsAnyKeys?: InputMaybe<Array<Scalars['String']>>;
  /** Contains the specified key. */
  containsKey?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['JSON']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['JSON']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['JSON']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['JSON']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['JSON']>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['JSON']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['JSON']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['JSON']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['JSON']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['JSON']>>;
};

export type KeygenThreshold = Node & {
  __typename?: 'KeygenThreshold';
  /** Reads a single `Block` that is related to this `KeygenThreshold`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  current?: Maybe<Scalars['Int']>;
  id: Scalars['String'];
  next?: Maybe<Scalars['Int']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  pending?: Maybe<Scalars['Int']>;
};

export type KeygenThresholdAggregates = {
  __typename?: 'KeygenThresholdAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<KeygenThresholdAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<KeygenThresholdDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<KeygenThresholdMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<KeygenThresholdMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<KeygenThresholdStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<KeygenThresholdStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<KeygenThresholdSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<KeygenThresholdVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<KeygenThresholdVarianceSampleAggregates>;
};

export type KeygenThresholdAverageAggregates = {
  __typename?: 'KeygenThresholdAverageAggregates';
  /** Mean average of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Mean average of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Mean average of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type KeygenThresholdDistinctCountAggregates = {
  __typename?: 'KeygenThresholdDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of current across the matching connection */
  current?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of next across the matching connection */
  next?: Maybe<Scalars['BigInt']>;
  /** Distinct count of pending across the matching connection */
  pending?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `KeygenThreshold` object types. All fields are combined with a logical ‘and.’ */
export type KeygenThresholdFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<KeygenThresholdFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `current` field. */
  current?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `next` field. */
  next?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<KeygenThresholdFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<KeygenThresholdFilter>>;
  /** Filter by the object’s `pending` field. */
  pending?: InputMaybe<IntFilter>;
};

export type KeygenThresholdMaxAggregates = {
  __typename?: 'KeygenThresholdMaxAggregates';
  /** Maximum of current across the matching connection */
  current?: Maybe<Scalars['Int']>;
  /** Maximum of next across the matching connection */
  next?: Maybe<Scalars['Int']>;
  /** Maximum of pending across the matching connection */
  pending?: Maybe<Scalars['Int']>;
};

export type KeygenThresholdMinAggregates = {
  __typename?: 'KeygenThresholdMinAggregates';
  /** Minimum of current across the matching connection */
  current?: Maybe<Scalars['Int']>;
  /** Minimum of next across the matching connection */
  next?: Maybe<Scalars['Int']>;
  /** Minimum of pending across the matching connection */
  pending?: Maybe<Scalars['Int']>;
};

export type KeygenThresholdStddevPopulationAggregates = {
  __typename?: 'KeygenThresholdStddevPopulationAggregates';
  /** Population standard deviation of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type KeygenThresholdStddevSampleAggregates = {
  __typename?: 'KeygenThresholdStddevSampleAggregates';
  /** Sample standard deviation of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type KeygenThresholdSumAggregates = {
  __typename?: 'KeygenThresholdSumAggregates';
  /** Sum of current across the matching connection */
  current: Scalars['BigInt'];
  /** Sum of next across the matching connection */
  next: Scalars['BigInt'];
  /** Sum of pending across the matching connection */
  pending: Scalars['BigInt'];
};

export type KeygenThresholdVariancePopulationAggregates = {
  __typename?: 'KeygenThresholdVariancePopulationAggregates';
  /** Population variance of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Population variance of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Population variance of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type KeygenThresholdVarianceSampleAggregates = {
  __typename?: 'KeygenThresholdVarianceSampleAggregates';
  /** Sample variance of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `KeygenThreshold` values. */
export type KeygenThresholdsConnection = {
  __typename?: 'KeygenThresholdsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<KeygenThresholdAggregates>;
  /** A list of edges which contains the `KeygenThreshold` and cursor to aid in pagination. */
  edges: Array<KeygenThresholdsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<KeygenThresholdAggregates>>;
  /** A list of `KeygenThreshold` objects. */
  nodes: Array<Maybe<KeygenThreshold>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `KeygenThreshold` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `KeygenThreshold` values. */
export type KeygenThresholdsConnectionGroupedAggregatesArgs = {
  groupBy: Array<KeygenThresholdsGroupBy>;
  having?: InputMaybe<KeygenThresholdsHavingInput>;
};

/** A `KeygenThreshold` edge in the connection. */
export type KeygenThresholdsEdge = {
  __typename?: 'KeygenThresholdsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `KeygenThreshold` at the end of the edge. */
  node?: Maybe<KeygenThreshold>;
};

/** Grouping methods for `KeygenThreshold` for usage during aggregation. */
export enum KeygenThresholdsGroupBy {
  BlockId = 'BLOCK_ID',
  Current = 'CURRENT',
  Next = 'NEXT',
  Pending = 'PENDING',
}

export type KeygenThresholdsHavingAverageInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type KeygenThresholdsHavingDistinctCountInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `KeygenThreshold` aggregates. */
export type KeygenThresholdsHavingInput = {
  AND?: InputMaybe<Array<KeygenThresholdsHavingInput>>;
  OR?: InputMaybe<Array<KeygenThresholdsHavingInput>>;
  average?: InputMaybe<KeygenThresholdsHavingAverageInput>;
  distinctCount?: InputMaybe<KeygenThresholdsHavingDistinctCountInput>;
  max?: InputMaybe<KeygenThresholdsHavingMaxInput>;
  min?: InputMaybe<KeygenThresholdsHavingMinInput>;
  stddevPopulation?: InputMaybe<KeygenThresholdsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<KeygenThresholdsHavingStddevSampleInput>;
  sum?: InputMaybe<KeygenThresholdsHavingSumInput>;
  variancePopulation?: InputMaybe<KeygenThresholdsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<KeygenThresholdsHavingVarianceSampleInput>;
};

export type KeygenThresholdsHavingMaxInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type KeygenThresholdsHavingMinInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type KeygenThresholdsHavingStddevPopulationInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type KeygenThresholdsHavingStddevSampleInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type KeygenThresholdsHavingSumInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type KeygenThresholdsHavingVariancePopulationInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type KeygenThresholdsHavingVarianceSampleInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `KeygenThreshold`. */
export enum KeygenThresholdsOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CurrentAsc = 'CURRENT_ASC',
  CurrentDesc = 'CURRENT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NextAsc = 'NEXT_ASC',
  NextDesc = 'NEXT_DESC',
  PendingAsc = 'PENDING_ASC',
  PendingDesc = 'PENDING_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** An object with a globally unique `ID`. */
export type Node = {
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['Cursor']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['Cursor']>;
};

/** The root query type which gives access points into the data universe. */
export type Query = Node & {
  __typename?: 'Query';
  _metadata?: Maybe<_Metadata>;
  account?: Maybe<Account>;
  /** Reads a single `Account` using its globally unique `ID`. */
  accountByNodeId?: Maybe<Account>;
  /** Reads and enables pagination through a set of `Account`. */
  accounts?: Maybe<AccountsConnection>;
  /** Reads and enables pagination through a set of `Authority`. */
  authorities?: Maybe<AuthoritiesConnection>;
  authority?: Maybe<Authority>;
  /** Reads a single `Authority` using its globally unique `ID`. */
  authorityByNodeId?: Maybe<Authority>;
  block?: Maybe<Block>;
  /** Reads a single `Block` using its globally unique `ID`. */
  blockByNodeId?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Block`. */
  blocks?: Maybe<BlocksConnection>;
  event?: Maybe<Event>;
  /** Reads a single `Event` using its globally unique `ID`. */
  eventByNodeId?: Maybe<Event>;
  /** Reads and enables pagination through a set of `Event`. */
  events?: Maybe<EventsConnection>;
  extrinsic?: Maybe<Extrinsic>;
  /** Reads a single `Extrinsic` using its globally unique `ID`. */
  extrinsicByNodeId?: Maybe<Extrinsic>;
  /** Reads and enables pagination through a set of `Extrinsic`. */
  extrinsics?: Maybe<ExtrinsicsConnection>;
  keygenThreshold?: Maybe<KeygenThreshold>;
  /** Reads a single `KeygenThreshold` using its globally unique `ID`. */
  keygenThresholdByNodeId?: Maybe<KeygenThreshold>;
  /** Reads and enables pagination through a set of `KeygenThreshold`. */
  keygenThresholds?: Maybe<KeygenThresholdsConnection>;
  /** Fetches an object given its globally unique `ID`. */
  node?: Maybe<Node>;
  /** The root query type must be a `Node` to work well with Relay 1 mutations. This just resolves to `query`. */
  nodeId: Scalars['ID'];
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  session?: Maybe<Session>;
  /** Reads a single `Session` using its globally unique `ID`. */
  sessionByNodeId?: Maybe<Session>;
  /** Reads and enables pagination through a set of `Session`. */
  sessions?: Maybe<SessionsConnection>;
  signatureThreshold?: Maybe<SignatureThreshold>;
  /** Reads a single `SignatureThreshold` using its globally unique `ID`. */
  signatureThresholdByNodeId?: Maybe<SignatureThreshold>;
  /** Reads and enables pagination through a set of `SignatureThreshold`. */
  signatureThresholds?: Maybe<SignatureThresholdsConnection>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAccountArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAccountByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAccountsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AccountFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AccountsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAuthoritiesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<AuthorityFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<AuthoritiesOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryAuthorityArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryAuthorityByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryBlockArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryBlockByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryBlocksArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<BlockFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<BlocksOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryEventArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryEventByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<EventFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<EventsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryExtrinsicArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryExtrinsicByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryExtrinsicsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ExtrinsicFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ExtrinsicsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryKeygenThresholdArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryKeygenThresholdByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryKeygenThresholdsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<KeygenThresholdFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<KeygenThresholdsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryNodeArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySessionArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySessionByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySessionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QuerySignatureThresholdArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySignatureThresholdByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySignatureThresholdsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SignatureThresholdFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SignatureThresholdsOrderBy>>;
};

export type Session = Node & {
  __typename?: 'Session';
  authorities: Scalars['JSON'];
  bestAuthorities: Scalars['JSON'];
  /** Reads a single `Block` that is related to this `Session`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  blockNumber: Scalars['Int'];
  id: Scalars['String'];
  keyGenThreshold?: Maybe<Scalars['JSON']>;
  nextAuthorities: Scalars['JSON'];
  nextBestAuthorities: Scalars['JSON'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  proposerThreshold?: Maybe<Scalars['JSON']>;
  proposers: Scalars['JSON'];
  proposersCount?: Maybe<Scalars['Int']>;
  signatureThreshold?: Maybe<Scalars['JSON']>;
};

export type SessionAggregates = {
  __typename?: 'SessionAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<SessionAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<SessionDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<SessionMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<SessionMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<SessionStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<SessionStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<SessionSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<SessionVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<SessionVarianceSampleAggregates>;
};

export type SessionAverageAggregates = {
  __typename?: 'SessionAverageAggregates';
  /** Mean average of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Mean average of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['BigFloat']>;
};

export type SessionDistinctCountAggregates = {
  __typename?: 'SessionDistinctCountAggregates';
  /** Distinct count of authorities across the matching connection */
  authorities?: Maybe<Scalars['BigInt']>;
  /** Distinct count of bestAuthorities across the matching connection */
  bestAuthorities?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of keyGenThreshold across the matching connection */
  keyGenThreshold?: Maybe<Scalars['BigInt']>;
  /** Distinct count of nextAuthorities across the matching connection */
  nextAuthorities?: Maybe<Scalars['BigInt']>;
  /** Distinct count of nextBestAuthorities across the matching connection */
  nextBestAuthorities?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposerThreshold across the matching connection */
  proposerThreshold?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposers across the matching connection */
  proposers?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['BigInt']>;
  /** Distinct count of signatureThreshold across the matching connection */
  signatureThreshold?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Session` object types. All fields are combined with a logical ‘and.’ */
export type SessionFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SessionFilter>>;
  /** Filter by the object’s `authorities` field. */
  authorities?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `bestAuthorities` field. */
  bestAuthorities?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `keyGenThreshold` field. */
  keyGenThreshold?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `nextAuthorities` field. */
  nextAuthorities?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `nextBestAuthorities` field. */
  nextBestAuthorities?: InputMaybe<JsonFilter>;
  /** Negates the expression. */
  not?: InputMaybe<SessionFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SessionFilter>>;
  /** Filter by the object’s `proposerThreshold` field. */
  proposerThreshold?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `proposers` field. */
  proposers?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `proposersCount` field. */
  proposersCount?: InputMaybe<IntFilter>;
  /** Filter by the object’s `signatureThreshold` field. */
  signatureThreshold?: InputMaybe<JsonFilter>;
};

export type SessionMaxAggregates = {
  __typename?: 'SessionMaxAggregates';
  /** Maximum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
  /** Maximum of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['Int']>;
};

export type SessionMinAggregates = {
  __typename?: 'SessionMinAggregates';
  /** Minimum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
  /** Minimum of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['Int']>;
};

export type SessionStddevPopulationAggregates = {
  __typename?: 'SessionStddevPopulationAggregates';
  /** Population standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['BigFloat']>;
};

export type SessionStddevSampleAggregates = {
  __typename?: 'SessionStddevSampleAggregates';
  /** Sample standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['BigFloat']>;
};

export type SessionSumAggregates = {
  __typename?: 'SessionSumAggregates';
  /** Sum of blockNumber across the matching connection */
  blockNumber: Scalars['BigInt'];
  /** Sum of proposersCount across the matching connection */
  proposersCount: Scalars['BigInt'];
};

export type SessionVariancePopulationAggregates = {
  __typename?: 'SessionVariancePopulationAggregates';
  /** Population variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population variance of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['BigFloat']>;
};

export type SessionVarianceSampleAggregates = {
  __typename?: 'SessionVarianceSampleAggregates';
  /** Sample variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `Session` values. */
export type SessionsConnection = {
  __typename?: 'SessionsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<SessionAggregates>;
  /** A list of edges which contains the `Session` and cursor to aid in pagination. */
  edges: Array<SessionsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<SessionAggregates>>;
  /** A list of `Session` objects. */
  nodes: Array<Maybe<Session>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Session` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Session` values. */
export type SessionsConnectionGroupedAggregatesArgs = {
  groupBy: Array<SessionsGroupBy>;
  having?: InputMaybe<SessionsHavingInput>;
};

/** A `Session` edge in the connection. */
export type SessionsEdge = {
  __typename?: 'SessionsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Session` at the end of the edge. */
  node?: Maybe<Session>;
};

/** Grouping methods for `Session` for usage during aggregation. */
export enum SessionsGroupBy {
  Authorities = 'AUTHORITIES',
  BestAuthorities = 'BEST_AUTHORITIES',
  BlockId = 'BLOCK_ID',
  BlockNumber = 'BLOCK_NUMBER',
  KeyGenThreshold = 'KEY_GEN_THRESHOLD',
  NextAuthorities = 'NEXT_AUTHORITIES',
  NextBestAuthorities = 'NEXT_BEST_AUTHORITIES',
  Proposers = 'PROPOSERS',
  ProposersCount = 'PROPOSERS_COUNT',
  ProposerThreshold = 'PROPOSER_THRESHOLD',
  SignatureThreshold = 'SIGNATURE_THRESHOLD',
}

export type SessionsHavingAverageInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

export type SessionsHavingDistinctCountInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `Session` aggregates. */
export type SessionsHavingInput = {
  AND?: InputMaybe<Array<SessionsHavingInput>>;
  OR?: InputMaybe<Array<SessionsHavingInput>>;
  average?: InputMaybe<SessionsHavingAverageInput>;
  distinctCount?: InputMaybe<SessionsHavingDistinctCountInput>;
  max?: InputMaybe<SessionsHavingMaxInput>;
  min?: InputMaybe<SessionsHavingMinInput>;
  stddevPopulation?: InputMaybe<SessionsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<SessionsHavingStddevSampleInput>;
  sum?: InputMaybe<SessionsHavingSumInput>;
  variancePopulation?: InputMaybe<SessionsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<SessionsHavingVarianceSampleInput>;
};

export type SessionsHavingMaxInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

export type SessionsHavingMinInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

export type SessionsHavingStddevPopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

export type SessionsHavingStddevSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

export type SessionsHavingSumInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

export type SessionsHavingVariancePopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

export type SessionsHavingVarianceSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  proposersCount?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `Session`. */
export enum SessionsOrderBy {
  AuthoritiesAsc = 'AUTHORITIES_ASC',
  AuthoritiesDesc = 'AUTHORITIES_DESC',
  BestAuthoritiesAsc = 'BEST_AUTHORITIES_ASC',
  BestAuthoritiesDesc = 'BEST_AUTHORITIES_DESC',
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  KeyGenThresholdAsc = 'KEY_GEN_THRESHOLD_ASC',
  KeyGenThresholdDesc = 'KEY_GEN_THRESHOLD_DESC',
  Natural = 'NATURAL',
  NextAuthoritiesAsc = 'NEXT_AUTHORITIES_ASC',
  NextAuthoritiesDesc = 'NEXT_AUTHORITIES_DESC',
  NextBestAuthoritiesAsc = 'NEXT_BEST_AUTHORITIES_ASC',
  NextBestAuthoritiesDesc = 'NEXT_BEST_AUTHORITIES_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposersAsc = 'PROPOSERS_ASC',
  ProposersCountAsc = 'PROPOSERS_COUNT_ASC',
  ProposersCountDesc = 'PROPOSERS_COUNT_DESC',
  ProposersDesc = 'PROPOSERS_DESC',
  ProposerThresholdAsc = 'PROPOSER_THRESHOLD_ASC',
  ProposerThresholdDesc = 'PROPOSER_THRESHOLD_DESC',
  SignatureThresholdAsc = 'SIGNATURE_THRESHOLD_ASC',
  SignatureThresholdDesc = 'SIGNATURE_THRESHOLD_DESC',
}

export type SignatureThreshold = Node & {
  __typename?: 'SignatureThreshold';
  /** Reads a single `Block` that is related to this `SignatureThreshold`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  current?: Maybe<Scalars['Int']>;
  id: Scalars['String'];
  next?: Maybe<Scalars['Int']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  pending?: Maybe<Scalars['Int']>;
};

export type SignatureThresholdAggregates = {
  __typename?: 'SignatureThresholdAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<SignatureThresholdAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<SignatureThresholdDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<SignatureThresholdMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<SignatureThresholdMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<SignatureThresholdStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<SignatureThresholdStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<SignatureThresholdSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<SignatureThresholdVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<SignatureThresholdVarianceSampleAggregates>;
};

export type SignatureThresholdAverageAggregates = {
  __typename?: 'SignatureThresholdAverageAggregates';
  /** Mean average of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Mean average of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Mean average of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type SignatureThresholdDistinctCountAggregates = {
  __typename?: 'SignatureThresholdDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of current across the matching connection */
  current?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of next across the matching connection */
  next?: Maybe<Scalars['BigInt']>;
  /** Distinct count of pending across the matching connection */
  pending?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `SignatureThreshold` object types. All fields are combined with a logical ‘and.’ */
export type SignatureThresholdFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SignatureThresholdFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `current` field. */
  current?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `next` field. */
  next?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<SignatureThresholdFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SignatureThresholdFilter>>;
  /** Filter by the object’s `pending` field. */
  pending?: InputMaybe<IntFilter>;
};

export type SignatureThresholdMaxAggregates = {
  __typename?: 'SignatureThresholdMaxAggregates';
  /** Maximum of current across the matching connection */
  current?: Maybe<Scalars['Int']>;
  /** Maximum of next across the matching connection */
  next?: Maybe<Scalars['Int']>;
  /** Maximum of pending across the matching connection */
  pending?: Maybe<Scalars['Int']>;
};

export type SignatureThresholdMinAggregates = {
  __typename?: 'SignatureThresholdMinAggregates';
  /** Minimum of current across the matching connection */
  current?: Maybe<Scalars['Int']>;
  /** Minimum of next across the matching connection */
  next?: Maybe<Scalars['Int']>;
  /** Minimum of pending across the matching connection */
  pending?: Maybe<Scalars['Int']>;
};

export type SignatureThresholdStddevPopulationAggregates = {
  __typename?: 'SignatureThresholdStddevPopulationAggregates';
  /** Population standard deviation of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type SignatureThresholdStddevSampleAggregates = {
  __typename?: 'SignatureThresholdStddevSampleAggregates';
  /** Sample standard deviation of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type SignatureThresholdSumAggregates = {
  __typename?: 'SignatureThresholdSumAggregates';
  /** Sum of current across the matching connection */
  current: Scalars['BigInt'];
  /** Sum of next across the matching connection */
  next: Scalars['BigInt'];
  /** Sum of pending across the matching connection */
  pending: Scalars['BigInt'];
};

export type SignatureThresholdVariancePopulationAggregates = {
  __typename?: 'SignatureThresholdVariancePopulationAggregates';
  /** Population variance of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Population variance of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Population variance of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

export type SignatureThresholdVarianceSampleAggregates = {
  __typename?: 'SignatureThresholdVarianceSampleAggregates';
  /** Sample variance of current across the matching connection */
  current?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of next across the matching connection */
  next?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of pending across the matching connection */
  pending?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `SignatureThreshold` values. */
export type SignatureThresholdsConnection = {
  __typename?: 'SignatureThresholdsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<SignatureThresholdAggregates>;
  /** A list of edges which contains the `SignatureThreshold` and cursor to aid in pagination. */
  edges: Array<SignatureThresholdsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<SignatureThresholdAggregates>>;
  /** A list of `SignatureThreshold` objects. */
  nodes: Array<Maybe<SignatureThreshold>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `SignatureThreshold` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `SignatureThreshold` values. */
export type SignatureThresholdsConnectionGroupedAggregatesArgs = {
  groupBy: Array<SignatureThresholdsGroupBy>;
  having?: InputMaybe<SignatureThresholdsHavingInput>;
};

/** A `SignatureThreshold` edge in the connection. */
export type SignatureThresholdsEdge = {
  __typename?: 'SignatureThresholdsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `SignatureThreshold` at the end of the edge. */
  node?: Maybe<SignatureThreshold>;
};

/** Grouping methods for `SignatureThreshold` for usage during aggregation. */
export enum SignatureThresholdsGroupBy {
  BlockId = 'BLOCK_ID',
  Current = 'CURRENT',
  Next = 'NEXT',
  Pending = 'PENDING',
}

export type SignatureThresholdsHavingAverageInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type SignatureThresholdsHavingDistinctCountInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `SignatureThreshold` aggregates. */
export type SignatureThresholdsHavingInput = {
  AND?: InputMaybe<Array<SignatureThresholdsHavingInput>>;
  OR?: InputMaybe<Array<SignatureThresholdsHavingInput>>;
  average?: InputMaybe<SignatureThresholdsHavingAverageInput>;
  distinctCount?: InputMaybe<SignatureThresholdsHavingDistinctCountInput>;
  max?: InputMaybe<SignatureThresholdsHavingMaxInput>;
  min?: InputMaybe<SignatureThresholdsHavingMinInput>;
  stddevPopulation?: InputMaybe<SignatureThresholdsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<SignatureThresholdsHavingStddevSampleInput>;
  sum?: InputMaybe<SignatureThresholdsHavingSumInput>;
  variancePopulation?: InputMaybe<SignatureThresholdsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<SignatureThresholdsHavingVarianceSampleInput>;
};

export type SignatureThresholdsHavingMaxInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type SignatureThresholdsHavingMinInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type SignatureThresholdsHavingStddevPopulationInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type SignatureThresholdsHavingStddevSampleInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type SignatureThresholdsHavingSumInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type SignatureThresholdsHavingVariancePopulationInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

export type SignatureThresholdsHavingVarianceSampleInput = {
  current?: InputMaybe<HavingIntFilter>;
  next?: InputMaybe<HavingIntFilter>;
  pending?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `SignatureThreshold`. */
export enum SignatureThresholdsOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CurrentAsc = 'CURRENT_ASC',
  CurrentDesc = 'CURRENT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NextAsc = 'NEXT_ASC',
  NextDesc = 'NEXT_DESC',
  PendingAsc = 'PENDING_ASC',
  PendingDesc = 'PENDING_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
}

/** A filter to be used against String fields. All fields are combined with a logical ‘and.’ */
export type StringFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value, treating null like an ordinary value (case-insensitive). */
  distinctFromInsensitive?: InputMaybe<Scalars['String']>;
  /** Ends with the specified string (case-sensitive). */
  endsWith?: InputMaybe<Scalars['String']>;
  /** Ends with the specified string (case-insensitive). */
  endsWithInsensitive?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value (case-insensitive). */
  equalToInsensitive?: InputMaybe<Scalars['String']>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<Scalars['String']>;
  /** Greater than the specified value (case-insensitive). */
  greaterThanInsensitive?: InputMaybe<Scalars['String']>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<Scalars['String']>;
  /** Greater than or equal to the specified value (case-insensitive). */
  greaterThanOrEqualToInsensitive?: InputMaybe<Scalars['String']>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<Scalars['String']>>;
  /** Included in the specified list (case-insensitive). */
  inInsensitive?: InputMaybe<Array<Scalars['String']>>;
  /** Contains the specified string (case-sensitive). */
  includes?: InputMaybe<Scalars['String']>;
  /** Contains the specified string (case-insensitive). */
  includesInsensitive?: InputMaybe<Scalars['String']>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<Scalars['String']>;
  /** Less than the specified value (case-insensitive). */
  lessThanInsensitive?: InputMaybe<Scalars['String']>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<Scalars['String']>;
  /** Less than or equal to the specified value (case-insensitive). */
  lessThanOrEqualToInsensitive?: InputMaybe<Scalars['String']>;
  /** Matches the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  like?: InputMaybe<Scalars['String']>;
  /** Matches the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  likeInsensitive?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<Scalars['String']>;
  /** Equal to the specified value, treating null like an ordinary value (case-insensitive). */
  notDistinctFromInsensitive?: InputMaybe<Scalars['String']>;
  /** Does not end with the specified string (case-sensitive). */
  notEndsWith?: InputMaybe<Scalars['String']>;
  /** Does not end with the specified string (case-insensitive). */
  notEndsWithInsensitive?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<Scalars['String']>;
  /** Not equal to the specified value (case-insensitive). */
  notEqualToInsensitive?: InputMaybe<Scalars['String']>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<Scalars['String']>>;
  /** Not included in the specified list (case-insensitive). */
  notInInsensitive?: InputMaybe<Array<Scalars['String']>>;
  /** Does not contain the specified string (case-sensitive). */
  notIncludes?: InputMaybe<Scalars['String']>;
  /** Does not contain the specified string (case-insensitive). */
  notIncludesInsensitive?: InputMaybe<Scalars['String']>;
  /** Does not match the specified pattern (case-sensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLike?: InputMaybe<Scalars['String']>;
  /** Does not match the specified pattern (case-insensitive). An underscore (_) matches any single character; a percent sign (%) matches any sequence of zero or more characters. */
  notLikeInsensitive?: InputMaybe<Scalars['String']>;
  /** Does not start with the specified string (case-sensitive). */
  notStartsWith?: InputMaybe<Scalars['String']>;
  /** Does not start with the specified string (case-insensitive). */
  notStartsWithInsensitive?: InputMaybe<Scalars['String']>;
  /** Starts with the specified string (case-sensitive). */
  startsWith?: InputMaybe<Scalars['String']>;
  /** Starts with the specified string (case-insensitive). */
  startsWithInsensitive?: InputMaybe<Scalars['String']>;
};

export type TableEstimate = {
  __typename?: 'TableEstimate';
  estimate?: Maybe<Scalars['Int']>;
  table?: Maybe<Scalars['String']>;
};

export type _Metadata = {
  __typename?: '_Metadata';
  chain?: Maybe<Scalars['String']>;
  dynamicDatasources?: Maybe<Scalars['String']>;
  genesisHash?: Maybe<Scalars['String']>;
  indexerHealthy?: Maybe<Scalars['Boolean']>;
  indexerNodeVersion?: Maybe<Scalars['String']>;
  lastProcessedHeight?: Maybe<Scalars['Int']>;
  lastProcessedTimestamp?: Maybe<Scalars['Date']>;
  queryNodeVersion?: Maybe<Scalars['String']>;
  rowCountEstimate?: Maybe<Array<Maybe<TableEstimate>>>;
  specName?: Maybe<Scalars['String']>;
  targetHeight?: Maybe<Scalars['Int']>;
};

export type CurrentSessionAuthoritiesQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentSessionAuthoritiesQuery = {
  __typename?: 'Query';
  sessions?: {
    __typename?: 'SessionsConnection';
    nodes: Array<{
      __typename?: 'Session';
      id: string;
      blockId: string;
      authorities: any;
      bestAuthorities: any;
      nextBestAuthorities: any;
      block?: { __typename?: 'Block'; id: string; timestamp?: any | null } | null;
    } | null>;
  } | null;
};

export const CurrentSessionAuthoritiesDocument = gql`
  query CurrentSessionAuthorities {
    sessions(last: 1, orderBy: [BLOCK_ID_ASC]) {
      nodes {
        id
        blockId
        authorities
        bestAuthorities
        nextBestAuthorities
        block {
          id
          timestamp
        }
      }
    }
  }
`;

/**
 * __useCurrentSessionAuthoritiesQuery__
 *
 * To run a query within a React component, call `useCurrentSessionAuthoritiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentSessionAuthoritiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentSessionAuthoritiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentSessionAuthoritiesQuery(
  baseOptions?: Apollo.QueryHookOptions<CurrentSessionAuthoritiesQuery, CurrentSessionAuthoritiesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CurrentSessionAuthoritiesQuery, CurrentSessionAuthoritiesQueryVariables>(
    CurrentSessionAuthoritiesDocument,
    options
  );
}
export function useCurrentSessionAuthoritiesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CurrentSessionAuthoritiesQuery, CurrentSessionAuthoritiesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CurrentSessionAuthoritiesQuery, CurrentSessionAuthoritiesQueryVariables>(
    CurrentSessionAuthoritiesDocument,
    options
  );
}
export type CurrentSessionAuthoritiesQueryHookResult = ReturnType<typeof useCurrentSessionAuthoritiesQuery>;
export type CurrentSessionAuthoritiesLazyQueryHookResult = ReturnType<typeof useCurrentSessionAuthoritiesLazyQuery>;
export type CurrentSessionAuthoritiesQueryResult = Apollo.QueryResult<
  CurrentSessionAuthoritiesQuery,
  CurrentSessionAuthoritiesQueryVariables
>;
