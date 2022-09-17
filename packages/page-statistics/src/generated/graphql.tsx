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
  extrinsics: ExtrinsicsConnection;
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

export type AccountExtrinsicsArgs = {
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
  /** Reads and enables pagination through a set of `ProposalCounter`. */
  proposalCounters: ProposalCountersConnection;
  /** Reads and enables pagination through a set of `ProposalItem`. */
  proposalItems: ProposalItemsConnection;
  /** Reads and enables pagination through a set of `ProposerThreshold`. */
  proposerThresholds: ProposerThresholdsConnection;
  /** Reads and enables pagination through a set of `Proposer`. */
  proposers: ProposersConnection;
  /** Reads and enables pagination through a set of `PublicKey`. */
  publicKeys: PublicKeysConnection;
  /** Reads and enables pagination through a set of `PublicKey`. */
  publicKeysBySessionBlockIdAndPublicKeyId: BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyConnection;
  /** Reads and enables pagination through a set of `Session`. */
  sessions: SessionsConnection;
  /** Reads and enables pagination through a set of `SignatureThreshold`. */
  signatureThresholds: SignatureThresholdsConnection;
  specVersion?: Maybe<Scalars['String']>;
  stateRoot?: Maybe<Scalars['String']>;
  timestamp?: Maybe<Scalars['Datetime']>;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueue`. */
  unsignedProposalsQueues: UnsignedProposalsQueuesConnection;
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

export type BlockProposalCountersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposalCounterFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposalCountersOrderBy>>;
};

export type BlockProposalItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposalItemFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposalItemsOrderBy>>;
};

export type BlockProposerThresholdsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposerThresholdFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposerThresholdsOrderBy>>;
};

export type BlockProposersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposerFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposersOrderBy>>;
};

export type BlockPublicKeysArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<PublicKeyFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<PublicKeysOrderBy>>;
};

export type BlockPublicKeysBySessionBlockIdAndPublicKeyIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<PublicKeyFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<PublicKeysOrderBy>>;
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

export type BlockUnsignedProposalsQueuesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<UnsignedProposalsQueueFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<UnsignedProposalsQueuesOrderBy>>;
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
  extrinsics: ExtrinsicsConnection;
  /** The `Account` at the end of the edge. */
  node?: Maybe<Account>;
};

/** A `Account` edge in the connection, with data from `Extrinsic`. */
export type BlockAccountsByExtrinsicBlockIdAndSignerIdManyToManyEdgeExtrinsicsArgs = {
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

/** A connection to a list of `PublicKey` values, with data from `Session`. */
export type BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyConnection = {
  __typename?: 'BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<PublicKeyAggregates>;
  /** A list of edges which contains the `PublicKey`, info from the `Session`, and the cursor to aid in pagination. */
  edges: Array<BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<PublicKeyAggregates>>;
  /** A list of `PublicKey` objects. */
  nodes: Array<Maybe<PublicKey>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `PublicKey` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `PublicKey` values, with data from `Session`. */
export type BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<PublicKeysGroupBy>;
  having?: InputMaybe<PublicKeysHavingInput>;
};

/** A `PublicKey` edge in the connection, with data from `Session`. */
export type BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyEdge = {
  __typename?: 'BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `PublicKey` at the end of the edge. */
  node?: Maybe<PublicKey>;
  /** Reads and enables pagination through a set of `Session`. */
  sessions: SessionsConnection;
};

/** A `PublicKey` edge in the connection, with data from `Session`. */
export type BlockPublicKeysBySessionBlockIdAndPublicKeyIdManyToManyEdgeSessionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionsOrderBy>>;
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
  ProposalCountersAverageBlockIdAsc = 'PROPOSAL_COUNTERS_AVERAGE_BLOCK_ID_ASC',
  ProposalCountersAverageBlockIdDesc = 'PROPOSAL_COUNTERS_AVERAGE_BLOCK_ID_DESC',
  ProposalCountersAverageBlockNumberAsc = 'PROPOSAL_COUNTERS_AVERAGE_BLOCK_NUMBER_ASC',
  ProposalCountersAverageBlockNumberDesc = 'PROPOSAL_COUNTERS_AVERAGE_BLOCK_NUMBER_DESC',
  ProposalCountersAverageIdAsc = 'PROPOSAL_COUNTERS_AVERAGE_ID_ASC',
  ProposalCountersAverageIdDesc = 'PROPOSAL_COUNTERS_AVERAGE_ID_DESC',
  ProposalCountersAverageSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_AVERAGE_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersAverageSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_AVERAGE_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersAverageSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_AVERAGE_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersAverageSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_AVERAGE_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersAverageStatusMapAsc = 'PROPOSAL_COUNTERS_AVERAGE_STATUS_MAP_ASC',
  ProposalCountersAverageStatusMapDesc = 'PROPOSAL_COUNTERS_AVERAGE_STATUS_MAP_DESC',
  ProposalCountersAverageUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_AVERAGE_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersAverageUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_AVERAGE_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersAverageUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_AVERAGE_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersAverageUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_AVERAGE_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersCountAsc = 'PROPOSAL_COUNTERS_COUNT_ASC',
  ProposalCountersCountDesc = 'PROPOSAL_COUNTERS_COUNT_DESC',
  ProposalCountersDistinctCountBlockIdAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_BLOCK_ID_ASC',
  ProposalCountersDistinctCountBlockIdDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_BLOCK_ID_DESC',
  ProposalCountersDistinctCountBlockNumberAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  ProposalCountersDistinctCountBlockNumberDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  ProposalCountersDistinctCountIdAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_ID_ASC',
  ProposalCountersDistinctCountIdDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_ID_DESC',
  ProposalCountersDistinctCountSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersDistinctCountSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersDistinctCountSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersDistinctCountSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersDistinctCountStatusMapAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_STATUS_MAP_ASC',
  ProposalCountersDistinctCountStatusMapDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_STATUS_MAP_DESC',
  ProposalCountersDistinctCountUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersDistinctCountUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersDistinctCountUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersDistinctCountUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_DISTINCT_COUNT_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersMaxBlockIdAsc = 'PROPOSAL_COUNTERS_MAX_BLOCK_ID_ASC',
  ProposalCountersMaxBlockIdDesc = 'PROPOSAL_COUNTERS_MAX_BLOCK_ID_DESC',
  ProposalCountersMaxBlockNumberAsc = 'PROPOSAL_COUNTERS_MAX_BLOCK_NUMBER_ASC',
  ProposalCountersMaxBlockNumberDesc = 'PROPOSAL_COUNTERS_MAX_BLOCK_NUMBER_DESC',
  ProposalCountersMaxIdAsc = 'PROPOSAL_COUNTERS_MAX_ID_ASC',
  ProposalCountersMaxIdDesc = 'PROPOSAL_COUNTERS_MAX_ID_DESC',
  ProposalCountersMaxSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_MAX_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersMaxSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_MAX_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersMaxSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_MAX_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersMaxSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_MAX_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersMaxStatusMapAsc = 'PROPOSAL_COUNTERS_MAX_STATUS_MAP_ASC',
  ProposalCountersMaxStatusMapDesc = 'PROPOSAL_COUNTERS_MAX_STATUS_MAP_DESC',
  ProposalCountersMaxUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_MAX_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersMaxUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_MAX_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersMaxUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_MAX_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersMaxUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_MAX_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersMinBlockIdAsc = 'PROPOSAL_COUNTERS_MIN_BLOCK_ID_ASC',
  ProposalCountersMinBlockIdDesc = 'PROPOSAL_COUNTERS_MIN_BLOCK_ID_DESC',
  ProposalCountersMinBlockNumberAsc = 'PROPOSAL_COUNTERS_MIN_BLOCK_NUMBER_ASC',
  ProposalCountersMinBlockNumberDesc = 'PROPOSAL_COUNTERS_MIN_BLOCK_NUMBER_DESC',
  ProposalCountersMinIdAsc = 'PROPOSAL_COUNTERS_MIN_ID_ASC',
  ProposalCountersMinIdDesc = 'PROPOSAL_COUNTERS_MIN_ID_DESC',
  ProposalCountersMinSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_MIN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersMinSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_MIN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersMinSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_MIN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersMinSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_MIN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersMinStatusMapAsc = 'PROPOSAL_COUNTERS_MIN_STATUS_MAP_ASC',
  ProposalCountersMinStatusMapDesc = 'PROPOSAL_COUNTERS_MIN_STATUS_MAP_DESC',
  ProposalCountersMinUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_MIN_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersMinUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_MIN_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersMinUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_MIN_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersMinUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_MIN_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersStddevPopulationBlockIdAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_BLOCK_ID_ASC',
  ProposalCountersStddevPopulationBlockIdDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_BLOCK_ID_DESC',
  ProposalCountersStddevPopulationBlockNumberAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  ProposalCountersStddevPopulationBlockNumberDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  ProposalCountersStddevPopulationIdAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_ID_ASC',
  ProposalCountersStddevPopulationIdDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_ID_DESC',
  ProposalCountersStddevPopulationSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersStddevPopulationSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersStddevPopulationSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersStddevPopulationSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersStddevPopulationStatusMapAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_STATUS_MAP_ASC',
  ProposalCountersStddevPopulationStatusMapDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_STATUS_MAP_DESC',
  ProposalCountersStddevPopulationUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersStddevPopulationUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersStddevPopulationUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersStddevPopulationUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_STDDEV_POPULATION_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersStddevSampleBlockIdAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  ProposalCountersStddevSampleBlockIdDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  ProposalCountersStddevSampleBlockNumberAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  ProposalCountersStddevSampleBlockNumberDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  ProposalCountersStddevSampleIdAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_ID_ASC',
  ProposalCountersStddevSampleIdDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_ID_DESC',
  ProposalCountersStddevSampleSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersStddevSampleSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersStddevSampleSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersStddevSampleSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersStddevSampleStatusMapAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_STATUS_MAP_ASC',
  ProposalCountersStddevSampleStatusMapDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_STATUS_MAP_DESC',
  ProposalCountersStddevSampleUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersStddevSampleUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersStddevSampleUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersStddevSampleUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_STDDEV_SAMPLE_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersSumBlockIdAsc = 'PROPOSAL_COUNTERS_SUM_BLOCK_ID_ASC',
  ProposalCountersSumBlockIdDesc = 'PROPOSAL_COUNTERS_SUM_BLOCK_ID_DESC',
  ProposalCountersSumBlockNumberAsc = 'PROPOSAL_COUNTERS_SUM_BLOCK_NUMBER_ASC',
  ProposalCountersSumBlockNumberDesc = 'PROPOSAL_COUNTERS_SUM_BLOCK_NUMBER_DESC',
  ProposalCountersSumIdAsc = 'PROPOSAL_COUNTERS_SUM_ID_ASC',
  ProposalCountersSumIdDesc = 'PROPOSAL_COUNTERS_SUM_ID_DESC',
  ProposalCountersSumSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_SUM_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersSumSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_SUM_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersSumSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_SUM_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersSumSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_SUM_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersSumStatusMapAsc = 'PROPOSAL_COUNTERS_SUM_STATUS_MAP_ASC',
  ProposalCountersSumStatusMapDesc = 'PROPOSAL_COUNTERS_SUM_STATUS_MAP_DESC',
  ProposalCountersSumUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_SUM_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersSumUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_SUM_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersSumUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_SUM_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersSumUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_SUM_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersVariancePopulationBlockIdAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  ProposalCountersVariancePopulationBlockIdDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  ProposalCountersVariancePopulationBlockNumberAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  ProposalCountersVariancePopulationBlockNumberDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  ProposalCountersVariancePopulationIdAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_ID_ASC',
  ProposalCountersVariancePopulationIdDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_ID_DESC',
  ProposalCountersVariancePopulationSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersVariancePopulationSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersVariancePopulationSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersVariancePopulationSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersVariancePopulationStatusMapAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_STATUS_MAP_ASC',
  ProposalCountersVariancePopulationStatusMapDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_STATUS_MAP_DESC',
  ProposalCountersVariancePopulationUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersVariancePopulationUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersVariancePopulationUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersVariancePopulationUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_VARIANCE_POPULATION_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersVarianceSampleBlockIdAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  ProposalCountersVarianceSampleBlockIdDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  ProposalCountersVarianceSampleBlockNumberAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  ProposalCountersVarianceSampleBlockNumberDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  ProposalCountersVarianceSampleIdAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_ID_ASC',
  ProposalCountersVarianceSampleIdDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_ID_DESC',
  ProposalCountersVarianceSampleSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersVarianceSampleSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersVarianceSampleSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersVarianceSampleSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_SIGNED_PROPOSALS_MAP_DESC',
  ProposalCountersVarianceSampleStatusMapAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_STATUS_MAP_ASC',
  ProposalCountersVarianceSampleStatusMapDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_STATUS_MAP_DESC',
  ProposalCountersVarianceSampleUnSignedProposalsCountAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_UN_SIGNED_PROPOSALS_COUNT_ASC',
  ProposalCountersVarianceSampleUnSignedProposalsCountDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_UN_SIGNED_PROPOSALS_COUNT_DESC',
  ProposalCountersVarianceSampleUnSignedProposalsMapAsc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_UN_SIGNED_PROPOSALS_MAP_ASC',
  ProposalCountersVarianceSampleUnSignedProposalsMapDesc = 'PROPOSAL_COUNTERS_VARIANCE_SAMPLE_UN_SIGNED_PROPOSALS_MAP_DESC',
  ProposalItemsAverageBlockIdAsc = 'PROPOSAL_ITEMS_AVERAGE_BLOCK_ID_ASC',
  ProposalItemsAverageBlockIdDesc = 'PROPOSAL_ITEMS_AVERAGE_BLOCK_ID_DESC',
  ProposalItemsAverageBlockNumberAsc = 'PROPOSAL_ITEMS_AVERAGE_BLOCK_NUMBER_ASC',
  ProposalItemsAverageBlockNumberDesc = 'PROPOSAL_ITEMS_AVERAGE_BLOCK_NUMBER_DESC',
  ProposalItemsAverageCurrentStatusAsc = 'PROPOSAL_ITEMS_AVERAGE_CURRENT_STATUS_ASC',
  ProposalItemsAverageCurrentStatusDesc = 'PROPOSAL_ITEMS_AVERAGE_CURRENT_STATUS_DESC',
  ProposalItemsAverageDataAsc = 'PROPOSAL_ITEMS_AVERAGE_DATA_ASC',
  ProposalItemsAverageDataDesc = 'PROPOSAL_ITEMS_AVERAGE_DATA_DESC',
  ProposalItemsAverageIdAsc = 'PROPOSAL_ITEMS_AVERAGE_ID_ASC',
  ProposalItemsAverageIdDesc = 'PROPOSAL_ITEMS_AVERAGE_ID_DESC',
  ProposalItemsAverageNonceAsc = 'PROPOSAL_ITEMS_AVERAGE_NONCE_ASC',
  ProposalItemsAverageNonceDesc = 'PROPOSAL_ITEMS_AVERAGE_NONCE_DESC',
  ProposalItemsAverageRemovedAsc = 'PROPOSAL_ITEMS_AVERAGE_REMOVED_ASC',
  ProposalItemsAverageRemovedDesc = 'PROPOSAL_ITEMS_AVERAGE_REMOVED_DESC',
  ProposalItemsAverageSignatureAsc = 'PROPOSAL_ITEMS_AVERAGE_SIGNATURE_ASC',
  ProposalItemsAverageSignatureDesc = 'PROPOSAL_ITEMS_AVERAGE_SIGNATURE_DESC',
  ProposalItemsAverageStatusAsc = 'PROPOSAL_ITEMS_AVERAGE_STATUS_ASC',
  ProposalItemsAverageStatusDesc = 'PROPOSAL_ITEMS_AVERAGE_STATUS_DESC',
  ProposalItemsAverageTimelineStatusAsc = 'PROPOSAL_ITEMS_AVERAGE_TIMELINE_STATUS_ASC',
  ProposalItemsAverageTimelineStatusDesc = 'PROPOSAL_ITEMS_AVERAGE_TIMELINE_STATUS_DESC',
  ProposalItemsAverageTypeAsc = 'PROPOSAL_ITEMS_AVERAGE_TYPE_ASC',
  ProposalItemsAverageTypeDesc = 'PROPOSAL_ITEMS_AVERAGE_TYPE_DESC',
  ProposalItemsAverageVotesAsc = 'PROPOSAL_ITEMS_AVERAGE_VOTES_ASC',
  ProposalItemsAverageVotesDesc = 'PROPOSAL_ITEMS_AVERAGE_VOTES_DESC',
  ProposalItemsCountAsc = 'PROPOSAL_ITEMS_COUNT_ASC',
  ProposalItemsCountDesc = 'PROPOSAL_ITEMS_COUNT_DESC',
  ProposalItemsDistinctCountBlockIdAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_BLOCK_ID_ASC',
  ProposalItemsDistinctCountBlockIdDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_BLOCK_ID_DESC',
  ProposalItemsDistinctCountBlockNumberAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  ProposalItemsDistinctCountBlockNumberDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  ProposalItemsDistinctCountCurrentStatusAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_CURRENT_STATUS_ASC',
  ProposalItemsDistinctCountCurrentStatusDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_CURRENT_STATUS_DESC',
  ProposalItemsDistinctCountDataAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_DATA_ASC',
  ProposalItemsDistinctCountDataDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_DATA_DESC',
  ProposalItemsDistinctCountIdAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_ID_ASC',
  ProposalItemsDistinctCountIdDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_ID_DESC',
  ProposalItemsDistinctCountNonceAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_NONCE_ASC',
  ProposalItemsDistinctCountNonceDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_NONCE_DESC',
  ProposalItemsDistinctCountRemovedAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_REMOVED_ASC',
  ProposalItemsDistinctCountRemovedDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_REMOVED_DESC',
  ProposalItemsDistinctCountSignatureAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_SIGNATURE_ASC',
  ProposalItemsDistinctCountSignatureDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_SIGNATURE_DESC',
  ProposalItemsDistinctCountStatusAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_STATUS_ASC',
  ProposalItemsDistinctCountStatusDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_STATUS_DESC',
  ProposalItemsDistinctCountTimelineStatusAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_TIMELINE_STATUS_ASC',
  ProposalItemsDistinctCountTimelineStatusDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_TIMELINE_STATUS_DESC',
  ProposalItemsDistinctCountTypeAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_TYPE_ASC',
  ProposalItemsDistinctCountTypeDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_TYPE_DESC',
  ProposalItemsDistinctCountVotesAsc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_VOTES_ASC',
  ProposalItemsDistinctCountVotesDesc = 'PROPOSAL_ITEMS_DISTINCT_COUNT_VOTES_DESC',
  ProposalItemsMaxBlockIdAsc = 'PROPOSAL_ITEMS_MAX_BLOCK_ID_ASC',
  ProposalItemsMaxBlockIdDesc = 'PROPOSAL_ITEMS_MAX_BLOCK_ID_DESC',
  ProposalItemsMaxBlockNumberAsc = 'PROPOSAL_ITEMS_MAX_BLOCK_NUMBER_ASC',
  ProposalItemsMaxBlockNumberDesc = 'PROPOSAL_ITEMS_MAX_BLOCK_NUMBER_DESC',
  ProposalItemsMaxCurrentStatusAsc = 'PROPOSAL_ITEMS_MAX_CURRENT_STATUS_ASC',
  ProposalItemsMaxCurrentStatusDesc = 'PROPOSAL_ITEMS_MAX_CURRENT_STATUS_DESC',
  ProposalItemsMaxDataAsc = 'PROPOSAL_ITEMS_MAX_DATA_ASC',
  ProposalItemsMaxDataDesc = 'PROPOSAL_ITEMS_MAX_DATA_DESC',
  ProposalItemsMaxIdAsc = 'PROPOSAL_ITEMS_MAX_ID_ASC',
  ProposalItemsMaxIdDesc = 'PROPOSAL_ITEMS_MAX_ID_DESC',
  ProposalItemsMaxNonceAsc = 'PROPOSAL_ITEMS_MAX_NONCE_ASC',
  ProposalItemsMaxNonceDesc = 'PROPOSAL_ITEMS_MAX_NONCE_DESC',
  ProposalItemsMaxRemovedAsc = 'PROPOSAL_ITEMS_MAX_REMOVED_ASC',
  ProposalItemsMaxRemovedDesc = 'PROPOSAL_ITEMS_MAX_REMOVED_DESC',
  ProposalItemsMaxSignatureAsc = 'PROPOSAL_ITEMS_MAX_SIGNATURE_ASC',
  ProposalItemsMaxSignatureDesc = 'PROPOSAL_ITEMS_MAX_SIGNATURE_DESC',
  ProposalItemsMaxStatusAsc = 'PROPOSAL_ITEMS_MAX_STATUS_ASC',
  ProposalItemsMaxStatusDesc = 'PROPOSAL_ITEMS_MAX_STATUS_DESC',
  ProposalItemsMaxTimelineStatusAsc = 'PROPOSAL_ITEMS_MAX_TIMELINE_STATUS_ASC',
  ProposalItemsMaxTimelineStatusDesc = 'PROPOSAL_ITEMS_MAX_TIMELINE_STATUS_DESC',
  ProposalItemsMaxTypeAsc = 'PROPOSAL_ITEMS_MAX_TYPE_ASC',
  ProposalItemsMaxTypeDesc = 'PROPOSAL_ITEMS_MAX_TYPE_DESC',
  ProposalItemsMaxVotesAsc = 'PROPOSAL_ITEMS_MAX_VOTES_ASC',
  ProposalItemsMaxVotesDesc = 'PROPOSAL_ITEMS_MAX_VOTES_DESC',
  ProposalItemsMinBlockIdAsc = 'PROPOSAL_ITEMS_MIN_BLOCK_ID_ASC',
  ProposalItemsMinBlockIdDesc = 'PROPOSAL_ITEMS_MIN_BLOCK_ID_DESC',
  ProposalItemsMinBlockNumberAsc = 'PROPOSAL_ITEMS_MIN_BLOCK_NUMBER_ASC',
  ProposalItemsMinBlockNumberDesc = 'PROPOSAL_ITEMS_MIN_BLOCK_NUMBER_DESC',
  ProposalItemsMinCurrentStatusAsc = 'PROPOSAL_ITEMS_MIN_CURRENT_STATUS_ASC',
  ProposalItemsMinCurrentStatusDesc = 'PROPOSAL_ITEMS_MIN_CURRENT_STATUS_DESC',
  ProposalItemsMinDataAsc = 'PROPOSAL_ITEMS_MIN_DATA_ASC',
  ProposalItemsMinDataDesc = 'PROPOSAL_ITEMS_MIN_DATA_DESC',
  ProposalItemsMinIdAsc = 'PROPOSAL_ITEMS_MIN_ID_ASC',
  ProposalItemsMinIdDesc = 'PROPOSAL_ITEMS_MIN_ID_DESC',
  ProposalItemsMinNonceAsc = 'PROPOSAL_ITEMS_MIN_NONCE_ASC',
  ProposalItemsMinNonceDesc = 'PROPOSAL_ITEMS_MIN_NONCE_DESC',
  ProposalItemsMinRemovedAsc = 'PROPOSAL_ITEMS_MIN_REMOVED_ASC',
  ProposalItemsMinRemovedDesc = 'PROPOSAL_ITEMS_MIN_REMOVED_DESC',
  ProposalItemsMinSignatureAsc = 'PROPOSAL_ITEMS_MIN_SIGNATURE_ASC',
  ProposalItemsMinSignatureDesc = 'PROPOSAL_ITEMS_MIN_SIGNATURE_DESC',
  ProposalItemsMinStatusAsc = 'PROPOSAL_ITEMS_MIN_STATUS_ASC',
  ProposalItemsMinStatusDesc = 'PROPOSAL_ITEMS_MIN_STATUS_DESC',
  ProposalItemsMinTimelineStatusAsc = 'PROPOSAL_ITEMS_MIN_TIMELINE_STATUS_ASC',
  ProposalItemsMinTimelineStatusDesc = 'PROPOSAL_ITEMS_MIN_TIMELINE_STATUS_DESC',
  ProposalItemsMinTypeAsc = 'PROPOSAL_ITEMS_MIN_TYPE_ASC',
  ProposalItemsMinTypeDesc = 'PROPOSAL_ITEMS_MIN_TYPE_DESC',
  ProposalItemsMinVotesAsc = 'PROPOSAL_ITEMS_MIN_VOTES_ASC',
  ProposalItemsMinVotesDesc = 'PROPOSAL_ITEMS_MIN_VOTES_DESC',
  ProposalItemsStddevPopulationBlockIdAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_BLOCK_ID_ASC',
  ProposalItemsStddevPopulationBlockIdDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_BLOCK_ID_DESC',
  ProposalItemsStddevPopulationBlockNumberAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  ProposalItemsStddevPopulationBlockNumberDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  ProposalItemsStddevPopulationCurrentStatusAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_CURRENT_STATUS_ASC',
  ProposalItemsStddevPopulationCurrentStatusDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_CURRENT_STATUS_DESC',
  ProposalItemsStddevPopulationDataAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_DATA_ASC',
  ProposalItemsStddevPopulationDataDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_DATA_DESC',
  ProposalItemsStddevPopulationIdAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_ID_ASC',
  ProposalItemsStddevPopulationIdDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_ID_DESC',
  ProposalItemsStddevPopulationNonceAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_NONCE_ASC',
  ProposalItemsStddevPopulationNonceDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_NONCE_DESC',
  ProposalItemsStddevPopulationRemovedAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_REMOVED_ASC',
  ProposalItemsStddevPopulationRemovedDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_REMOVED_DESC',
  ProposalItemsStddevPopulationSignatureAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_SIGNATURE_ASC',
  ProposalItemsStddevPopulationSignatureDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_SIGNATURE_DESC',
  ProposalItemsStddevPopulationStatusAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_STATUS_ASC',
  ProposalItemsStddevPopulationStatusDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_STATUS_DESC',
  ProposalItemsStddevPopulationTimelineStatusAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_TIMELINE_STATUS_ASC',
  ProposalItemsStddevPopulationTimelineStatusDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_TIMELINE_STATUS_DESC',
  ProposalItemsStddevPopulationTypeAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_TYPE_ASC',
  ProposalItemsStddevPopulationTypeDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_TYPE_DESC',
  ProposalItemsStddevPopulationVotesAsc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_VOTES_ASC',
  ProposalItemsStddevPopulationVotesDesc = 'PROPOSAL_ITEMS_STDDEV_POPULATION_VOTES_DESC',
  ProposalItemsStddevSampleBlockIdAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  ProposalItemsStddevSampleBlockIdDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  ProposalItemsStddevSampleBlockNumberAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  ProposalItemsStddevSampleBlockNumberDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  ProposalItemsStddevSampleCurrentStatusAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_CURRENT_STATUS_ASC',
  ProposalItemsStddevSampleCurrentStatusDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_CURRENT_STATUS_DESC',
  ProposalItemsStddevSampleDataAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_DATA_ASC',
  ProposalItemsStddevSampleDataDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_DATA_DESC',
  ProposalItemsStddevSampleIdAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_ID_ASC',
  ProposalItemsStddevSampleIdDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_ID_DESC',
  ProposalItemsStddevSampleNonceAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_NONCE_ASC',
  ProposalItemsStddevSampleNonceDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_NONCE_DESC',
  ProposalItemsStddevSampleRemovedAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_REMOVED_ASC',
  ProposalItemsStddevSampleRemovedDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_REMOVED_DESC',
  ProposalItemsStddevSampleSignatureAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_SIGNATURE_ASC',
  ProposalItemsStddevSampleSignatureDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_SIGNATURE_DESC',
  ProposalItemsStddevSampleStatusAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_STATUS_ASC',
  ProposalItemsStddevSampleStatusDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_STATUS_DESC',
  ProposalItemsStddevSampleTimelineStatusAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_TIMELINE_STATUS_ASC',
  ProposalItemsStddevSampleTimelineStatusDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_TIMELINE_STATUS_DESC',
  ProposalItemsStddevSampleTypeAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_TYPE_ASC',
  ProposalItemsStddevSampleTypeDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_TYPE_DESC',
  ProposalItemsStddevSampleVotesAsc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_VOTES_ASC',
  ProposalItemsStddevSampleVotesDesc = 'PROPOSAL_ITEMS_STDDEV_SAMPLE_VOTES_DESC',
  ProposalItemsSumBlockIdAsc = 'PROPOSAL_ITEMS_SUM_BLOCK_ID_ASC',
  ProposalItemsSumBlockIdDesc = 'PROPOSAL_ITEMS_SUM_BLOCK_ID_DESC',
  ProposalItemsSumBlockNumberAsc = 'PROPOSAL_ITEMS_SUM_BLOCK_NUMBER_ASC',
  ProposalItemsSumBlockNumberDesc = 'PROPOSAL_ITEMS_SUM_BLOCK_NUMBER_DESC',
  ProposalItemsSumCurrentStatusAsc = 'PROPOSAL_ITEMS_SUM_CURRENT_STATUS_ASC',
  ProposalItemsSumCurrentStatusDesc = 'PROPOSAL_ITEMS_SUM_CURRENT_STATUS_DESC',
  ProposalItemsSumDataAsc = 'PROPOSAL_ITEMS_SUM_DATA_ASC',
  ProposalItemsSumDataDesc = 'PROPOSAL_ITEMS_SUM_DATA_DESC',
  ProposalItemsSumIdAsc = 'PROPOSAL_ITEMS_SUM_ID_ASC',
  ProposalItemsSumIdDesc = 'PROPOSAL_ITEMS_SUM_ID_DESC',
  ProposalItemsSumNonceAsc = 'PROPOSAL_ITEMS_SUM_NONCE_ASC',
  ProposalItemsSumNonceDesc = 'PROPOSAL_ITEMS_SUM_NONCE_DESC',
  ProposalItemsSumRemovedAsc = 'PROPOSAL_ITEMS_SUM_REMOVED_ASC',
  ProposalItemsSumRemovedDesc = 'PROPOSAL_ITEMS_SUM_REMOVED_DESC',
  ProposalItemsSumSignatureAsc = 'PROPOSAL_ITEMS_SUM_SIGNATURE_ASC',
  ProposalItemsSumSignatureDesc = 'PROPOSAL_ITEMS_SUM_SIGNATURE_DESC',
  ProposalItemsSumStatusAsc = 'PROPOSAL_ITEMS_SUM_STATUS_ASC',
  ProposalItemsSumStatusDesc = 'PROPOSAL_ITEMS_SUM_STATUS_DESC',
  ProposalItemsSumTimelineStatusAsc = 'PROPOSAL_ITEMS_SUM_TIMELINE_STATUS_ASC',
  ProposalItemsSumTimelineStatusDesc = 'PROPOSAL_ITEMS_SUM_TIMELINE_STATUS_DESC',
  ProposalItemsSumTypeAsc = 'PROPOSAL_ITEMS_SUM_TYPE_ASC',
  ProposalItemsSumTypeDesc = 'PROPOSAL_ITEMS_SUM_TYPE_DESC',
  ProposalItemsSumVotesAsc = 'PROPOSAL_ITEMS_SUM_VOTES_ASC',
  ProposalItemsSumVotesDesc = 'PROPOSAL_ITEMS_SUM_VOTES_DESC',
  ProposalItemsVariancePopulationBlockIdAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  ProposalItemsVariancePopulationBlockIdDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  ProposalItemsVariancePopulationBlockNumberAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  ProposalItemsVariancePopulationBlockNumberDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  ProposalItemsVariancePopulationCurrentStatusAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_CURRENT_STATUS_ASC',
  ProposalItemsVariancePopulationCurrentStatusDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_CURRENT_STATUS_DESC',
  ProposalItemsVariancePopulationDataAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_DATA_ASC',
  ProposalItemsVariancePopulationDataDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_DATA_DESC',
  ProposalItemsVariancePopulationIdAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_ID_ASC',
  ProposalItemsVariancePopulationIdDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_ID_DESC',
  ProposalItemsVariancePopulationNonceAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_NONCE_ASC',
  ProposalItemsVariancePopulationNonceDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_NONCE_DESC',
  ProposalItemsVariancePopulationRemovedAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_REMOVED_ASC',
  ProposalItemsVariancePopulationRemovedDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_REMOVED_DESC',
  ProposalItemsVariancePopulationSignatureAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_SIGNATURE_ASC',
  ProposalItemsVariancePopulationSignatureDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_SIGNATURE_DESC',
  ProposalItemsVariancePopulationStatusAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_STATUS_ASC',
  ProposalItemsVariancePopulationStatusDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_STATUS_DESC',
  ProposalItemsVariancePopulationTimelineStatusAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_TIMELINE_STATUS_ASC',
  ProposalItemsVariancePopulationTimelineStatusDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_TIMELINE_STATUS_DESC',
  ProposalItemsVariancePopulationTypeAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_TYPE_ASC',
  ProposalItemsVariancePopulationTypeDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_TYPE_DESC',
  ProposalItemsVariancePopulationVotesAsc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_VOTES_ASC',
  ProposalItemsVariancePopulationVotesDesc = 'PROPOSAL_ITEMS_VARIANCE_POPULATION_VOTES_DESC',
  ProposalItemsVarianceSampleBlockIdAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  ProposalItemsVarianceSampleBlockIdDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  ProposalItemsVarianceSampleBlockNumberAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  ProposalItemsVarianceSampleBlockNumberDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  ProposalItemsVarianceSampleCurrentStatusAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_CURRENT_STATUS_ASC',
  ProposalItemsVarianceSampleCurrentStatusDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_CURRENT_STATUS_DESC',
  ProposalItemsVarianceSampleDataAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_DATA_ASC',
  ProposalItemsVarianceSampleDataDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_DATA_DESC',
  ProposalItemsVarianceSampleIdAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_ID_ASC',
  ProposalItemsVarianceSampleIdDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_ID_DESC',
  ProposalItemsVarianceSampleNonceAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_NONCE_ASC',
  ProposalItemsVarianceSampleNonceDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_NONCE_DESC',
  ProposalItemsVarianceSampleRemovedAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_REMOVED_ASC',
  ProposalItemsVarianceSampleRemovedDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_REMOVED_DESC',
  ProposalItemsVarianceSampleSignatureAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_SIGNATURE_ASC',
  ProposalItemsVarianceSampleSignatureDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_SIGNATURE_DESC',
  ProposalItemsVarianceSampleStatusAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_STATUS_ASC',
  ProposalItemsVarianceSampleStatusDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_STATUS_DESC',
  ProposalItemsVarianceSampleTimelineStatusAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_TIMELINE_STATUS_ASC',
  ProposalItemsVarianceSampleTimelineStatusDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_TIMELINE_STATUS_DESC',
  ProposalItemsVarianceSampleTypeAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_TYPE_ASC',
  ProposalItemsVarianceSampleTypeDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_TYPE_DESC',
  ProposalItemsVarianceSampleVotesAsc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_VOTES_ASC',
  ProposalItemsVarianceSampleVotesDesc = 'PROPOSAL_ITEMS_VARIANCE_SAMPLE_VOTES_DESC',
  ProposersAverageBlockIdAsc = 'PROPOSERS_AVERAGE_BLOCK_ID_ASC',
  ProposersAverageBlockIdDesc = 'PROPOSERS_AVERAGE_BLOCK_ID_DESC',
  ProposersAverageCountAsc = 'PROPOSERS_AVERAGE_COUNT_ASC',
  ProposersAverageCountDesc = 'PROPOSERS_AVERAGE_COUNT_DESC',
  ProposersAverageIdAsc = 'PROPOSERS_AVERAGE_ID_ASC',
  ProposersAverageIdDesc = 'PROPOSERS_AVERAGE_ID_DESC',
  ProposersAverageProposersAsc = 'PROPOSERS_AVERAGE_PROPOSERS_ASC',
  ProposersAverageProposersDesc = 'PROPOSERS_AVERAGE_PROPOSERS_DESC',
  ProposersCountAsc = 'PROPOSERS_COUNT_ASC',
  ProposersCountDesc = 'PROPOSERS_COUNT_DESC',
  ProposersDistinctCountBlockIdAsc = 'PROPOSERS_DISTINCT_COUNT_BLOCK_ID_ASC',
  ProposersDistinctCountBlockIdDesc = 'PROPOSERS_DISTINCT_COUNT_BLOCK_ID_DESC',
  ProposersDistinctCountCountAsc = 'PROPOSERS_DISTINCT_COUNT_COUNT_ASC',
  ProposersDistinctCountCountDesc = 'PROPOSERS_DISTINCT_COUNT_COUNT_DESC',
  ProposersDistinctCountIdAsc = 'PROPOSERS_DISTINCT_COUNT_ID_ASC',
  ProposersDistinctCountIdDesc = 'PROPOSERS_DISTINCT_COUNT_ID_DESC',
  ProposersDistinctCountProposersAsc = 'PROPOSERS_DISTINCT_COUNT_PROPOSERS_ASC',
  ProposersDistinctCountProposersDesc = 'PROPOSERS_DISTINCT_COUNT_PROPOSERS_DESC',
  ProposersMaxBlockIdAsc = 'PROPOSERS_MAX_BLOCK_ID_ASC',
  ProposersMaxBlockIdDesc = 'PROPOSERS_MAX_BLOCK_ID_DESC',
  ProposersMaxCountAsc = 'PROPOSERS_MAX_COUNT_ASC',
  ProposersMaxCountDesc = 'PROPOSERS_MAX_COUNT_DESC',
  ProposersMaxIdAsc = 'PROPOSERS_MAX_ID_ASC',
  ProposersMaxIdDesc = 'PROPOSERS_MAX_ID_DESC',
  ProposersMaxProposersAsc = 'PROPOSERS_MAX_PROPOSERS_ASC',
  ProposersMaxProposersDesc = 'PROPOSERS_MAX_PROPOSERS_DESC',
  ProposersMinBlockIdAsc = 'PROPOSERS_MIN_BLOCK_ID_ASC',
  ProposersMinBlockIdDesc = 'PROPOSERS_MIN_BLOCK_ID_DESC',
  ProposersMinCountAsc = 'PROPOSERS_MIN_COUNT_ASC',
  ProposersMinCountDesc = 'PROPOSERS_MIN_COUNT_DESC',
  ProposersMinIdAsc = 'PROPOSERS_MIN_ID_ASC',
  ProposersMinIdDesc = 'PROPOSERS_MIN_ID_DESC',
  ProposersMinProposersAsc = 'PROPOSERS_MIN_PROPOSERS_ASC',
  ProposersMinProposersDesc = 'PROPOSERS_MIN_PROPOSERS_DESC',
  ProposersStddevPopulationBlockIdAsc = 'PROPOSERS_STDDEV_POPULATION_BLOCK_ID_ASC',
  ProposersStddevPopulationBlockIdDesc = 'PROPOSERS_STDDEV_POPULATION_BLOCK_ID_DESC',
  ProposersStddevPopulationCountAsc = 'PROPOSERS_STDDEV_POPULATION_COUNT_ASC',
  ProposersStddevPopulationCountDesc = 'PROPOSERS_STDDEV_POPULATION_COUNT_DESC',
  ProposersStddevPopulationIdAsc = 'PROPOSERS_STDDEV_POPULATION_ID_ASC',
  ProposersStddevPopulationIdDesc = 'PROPOSERS_STDDEV_POPULATION_ID_DESC',
  ProposersStddevPopulationProposersAsc = 'PROPOSERS_STDDEV_POPULATION_PROPOSERS_ASC',
  ProposersStddevPopulationProposersDesc = 'PROPOSERS_STDDEV_POPULATION_PROPOSERS_DESC',
  ProposersStddevSampleBlockIdAsc = 'PROPOSERS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  ProposersStddevSampleBlockIdDesc = 'PROPOSERS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  ProposersStddevSampleCountAsc = 'PROPOSERS_STDDEV_SAMPLE_COUNT_ASC',
  ProposersStddevSampleCountDesc = 'PROPOSERS_STDDEV_SAMPLE_COUNT_DESC',
  ProposersStddevSampleIdAsc = 'PROPOSERS_STDDEV_SAMPLE_ID_ASC',
  ProposersStddevSampleIdDesc = 'PROPOSERS_STDDEV_SAMPLE_ID_DESC',
  ProposersStddevSampleProposersAsc = 'PROPOSERS_STDDEV_SAMPLE_PROPOSERS_ASC',
  ProposersStddevSampleProposersDesc = 'PROPOSERS_STDDEV_SAMPLE_PROPOSERS_DESC',
  ProposersSumBlockIdAsc = 'PROPOSERS_SUM_BLOCK_ID_ASC',
  ProposersSumBlockIdDesc = 'PROPOSERS_SUM_BLOCK_ID_DESC',
  ProposersSumCountAsc = 'PROPOSERS_SUM_COUNT_ASC',
  ProposersSumCountDesc = 'PROPOSERS_SUM_COUNT_DESC',
  ProposersSumIdAsc = 'PROPOSERS_SUM_ID_ASC',
  ProposersSumIdDesc = 'PROPOSERS_SUM_ID_DESC',
  ProposersSumProposersAsc = 'PROPOSERS_SUM_PROPOSERS_ASC',
  ProposersSumProposersDesc = 'PROPOSERS_SUM_PROPOSERS_DESC',
  ProposersVariancePopulationBlockIdAsc = 'PROPOSERS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  ProposersVariancePopulationBlockIdDesc = 'PROPOSERS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  ProposersVariancePopulationCountAsc = 'PROPOSERS_VARIANCE_POPULATION_COUNT_ASC',
  ProposersVariancePopulationCountDesc = 'PROPOSERS_VARIANCE_POPULATION_COUNT_DESC',
  ProposersVariancePopulationIdAsc = 'PROPOSERS_VARIANCE_POPULATION_ID_ASC',
  ProposersVariancePopulationIdDesc = 'PROPOSERS_VARIANCE_POPULATION_ID_DESC',
  ProposersVariancePopulationProposersAsc = 'PROPOSERS_VARIANCE_POPULATION_PROPOSERS_ASC',
  ProposersVariancePopulationProposersDesc = 'PROPOSERS_VARIANCE_POPULATION_PROPOSERS_DESC',
  ProposersVarianceSampleBlockIdAsc = 'PROPOSERS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  ProposersVarianceSampleBlockIdDesc = 'PROPOSERS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  ProposersVarianceSampleCountAsc = 'PROPOSERS_VARIANCE_SAMPLE_COUNT_ASC',
  ProposersVarianceSampleCountDesc = 'PROPOSERS_VARIANCE_SAMPLE_COUNT_DESC',
  ProposersVarianceSampleIdAsc = 'PROPOSERS_VARIANCE_SAMPLE_ID_ASC',
  ProposersVarianceSampleIdDesc = 'PROPOSERS_VARIANCE_SAMPLE_ID_DESC',
  ProposersVarianceSampleProposersAsc = 'PROPOSERS_VARIANCE_SAMPLE_PROPOSERS_ASC',
  ProposersVarianceSampleProposersDesc = 'PROPOSERS_VARIANCE_SAMPLE_PROPOSERS_DESC',
  ProposerThresholdsAverageBlockIdAsc = 'PROPOSER_THRESHOLDS_AVERAGE_BLOCK_ID_ASC',
  ProposerThresholdsAverageBlockIdDesc = 'PROPOSER_THRESHOLDS_AVERAGE_BLOCK_ID_DESC',
  ProposerThresholdsAverageIdAsc = 'PROPOSER_THRESHOLDS_AVERAGE_ID_ASC',
  ProposerThresholdsAverageIdDesc = 'PROPOSER_THRESHOLDS_AVERAGE_ID_DESC',
  ProposerThresholdsAverageValueAsc = 'PROPOSER_THRESHOLDS_AVERAGE_VALUE_ASC',
  ProposerThresholdsAverageValueDesc = 'PROPOSER_THRESHOLDS_AVERAGE_VALUE_DESC',
  ProposerThresholdsCountAsc = 'PROPOSER_THRESHOLDS_COUNT_ASC',
  ProposerThresholdsCountDesc = 'PROPOSER_THRESHOLDS_COUNT_DESC',
  ProposerThresholdsDistinctCountBlockIdAsc = 'PROPOSER_THRESHOLDS_DISTINCT_COUNT_BLOCK_ID_ASC',
  ProposerThresholdsDistinctCountBlockIdDesc = 'PROPOSER_THRESHOLDS_DISTINCT_COUNT_BLOCK_ID_DESC',
  ProposerThresholdsDistinctCountIdAsc = 'PROPOSER_THRESHOLDS_DISTINCT_COUNT_ID_ASC',
  ProposerThresholdsDistinctCountIdDesc = 'PROPOSER_THRESHOLDS_DISTINCT_COUNT_ID_DESC',
  ProposerThresholdsDistinctCountValueAsc = 'PROPOSER_THRESHOLDS_DISTINCT_COUNT_VALUE_ASC',
  ProposerThresholdsDistinctCountValueDesc = 'PROPOSER_THRESHOLDS_DISTINCT_COUNT_VALUE_DESC',
  ProposerThresholdsMaxBlockIdAsc = 'PROPOSER_THRESHOLDS_MAX_BLOCK_ID_ASC',
  ProposerThresholdsMaxBlockIdDesc = 'PROPOSER_THRESHOLDS_MAX_BLOCK_ID_DESC',
  ProposerThresholdsMaxIdAsc = 'PROPOSER_THRESHOLDS_MAX_ID_ASC',
  ProposerThresholdsMaxIdDesc = 'PROPOSER_THRESHOLDS_MAX_ID_DESC',
  ProposerThresholdsMaxValueAsc = 'PROPOSER_THRESHOLDS_MAX_VALUE_ASC',
  ProposerThresholdsMaxValueDesc = 'PROPOSER_THRESHOLDS_MAX_VALUE_DESC',
  ProposerThresholdsMinBlockIdAsc = 'PROPOSER_THRESHOLDS_MIN_BLOCK_ID_ASC',
  ProposerThresholdsMinBlockIdDesc = 'PROPOSER_THRESHOLDS_MIN_BLOCK_ID_DESC',
  ProposerThresholdsMinIdAsc = 'PROPOSER_THRESHOLDS_MIN_ID_ASC',
  ProposerThresholdsMinIdDesc = 'PROPOSER_THRESHOLDS_MIN_ID_DESC',
  ProposerThresholdsMinValueAsc = 'PROPOSER_THRESHOLDS_MIN_VALUE_ASC',
  ProposerThresholdsMinValueDesc = 'PROPOSER_THRESHOLDS_MIN_VALUE_DESC',
  ProposerThresholdsStddevPopulationBlockIdAsc = 'PROPOSER_THRESHOLDS_STDDEV_POPULATION_BLOCK_ID_ASC',
  ProposerThresholdsStddevPopulationBlockIdDesc = 'PROPOSER_THRESHOLDS_STDDEV_POPULATION_BLOCK_ID_DESC',
  ProposerThresholdsStddevPopulationIdAsc = 'PROPOSER_THRESHOLDS_STDDEV_POPULATION_ID_ASC',
  ProposerThresholdsStddevPopulationIdDesc = 'PROPOSER_THRESHOLDS_STDDEV_POPULATION_ID_DESC',
  ProposerThresholdsStddevPopulationValueAsc = 'PROPOSER_THRESHOLDS_STDDEV_POPULATION_VALUE_ASC',
  ProposerThresholdsStddevPopulationValueDesc = 'PROPOSER_THRESHOLDS_STDDEV_POPULATION_VALUE_DESC',
  ProposerThresholdsStddevSampleBlockIdAsc = 'PROPOSER_THRESHOLDS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  ProposerThresholdsStddevSampleBlockIdDesc = 'PROPOSER_THRESHOLDS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  ProposerThresholdsStddevSampleIdAsc = 'PROPOSER_THRESHOLDS_STDDEV_SAMPLE_ID_ASC',
  ProposerThresholdsStddevSampleIdDesc = 'PROPOSER_THRESHOLDS_STDDEV_SAMPLE_ID_DESC',
  ProposerThresholdsStddevSampleValueAsc = 'PROPOSER_THRESHOLDS_STDDEV_SAMPLE_VALUE_ASC',
  ProposerThresholdsStddevSampleValueDesc = 'PROPOSER_THRESHOLDS_STDDEV_SAMPLE_VALUE_DESC',
  ProposerThresholdsSumBlockIdAsc = 'PROPOSER_THRESHOLDS_SUM_BLOCK_ID_ASC',
  ProposerThresholdsSumBlockIdDesc = 'PROPOSER_THRESHOLDS_SUM_BLOCK_ID_DESC',
  ProposerThresholdsSumIdAsc = 'PROPOSER_THRESHOLDS_SUM_ID_ASC',
  ProposerThresholdsSumIdDesc = 'PROPOSER_THRESHOLDS_SUM_ID_DESC',
  ProposerThresholdsSumValueAsc = 'PROPOSER_THRESHOLDS_SUM_VALUE_ASC',
  ProposerThresholdsSumValueDesc = 'PROPOSER_THRESHOLDS_SUM_VALUE_DESC',
  ProposerThresholdsVariancePopulationBlockIdAsc = 'PROPOSER_THRESHOLDS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  ProposerThresholdsVariancePopulationBlockIdDesc = 'PROPOSER_THRESHOLDS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  ProposerThresholdsVariancePopulationIdAsc = 'PROPOSER_THRESHOLDS_VARIANCE_POPULATION_ID_ASC',
  ProposerThresholdsVariancePopulationIdDesc = 'PROPOSER_THRESHOLDS_VARIANCE_POPULATION_ID_DESC',
  ProposerThresholdsVariancePopulationValueAsc = 'PROPOSER_THRESHOLDS_VARIANCE_POPULATION_VALUE_ASC',
  ProposerThresholdsVariancePopulationValueDesc = 'PROPOSER_THRESHOLDS_VARIANCE_POPULATION_VALUE_DESC',
  ProposerThresholdsVarianceSampleBlockIdAsc = 'PROPOSER_THRESHOLDS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  ProposerThresholdsVarianceSampleBlockIdDesc = 'PROPOSER_THRESHOLDS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  ProposerThresholdsVarianceSampleIdAsc = 'PROPOSER_THRESHOLDS_VARIANCE_SAMPLE_ID_ASC',
  ProposerThresholdsVarianceSampleIdDesc = 'PROPOSER_THRESHOLDS_VARIANCE_SAMPLE_ID_DESC',
  ProposerThresholdsVarianceSampleValueAsc = 'PROPOSER_THRESHOLDS_VARIANCE_SAMPLE_VALUE_ASC',
  ProposerThresholdsVarianceSampleValueDesc = 'PROPOSER_THRESHOLDS_VARIANCE_SAMPLE_VALUE_DESC',
  PublicKeysAverageBlockIdAsc = 'PUBLIC_KEYS_AVERAGE_BLOCK_ID_ASC',
  PublicKeysAverageBlockIdDesc = 'PUBLIC_KEYS_AVERAGE_BLOCK_ID_DESC',
  PublicKeysAverageCompressedAsc = 'PUBLIC_KEYS_AVERAGE_COMPRESSED_ASC',
  PublicKeysAverageCompressedDesc = 'PUBLIC_KEYS_AVERAGE_COMPRESSED_DESC',
  PublicKeysAverageHistoryAsc = 'PUBLIC_KEYS_AVERAGE_HISTORY_ASC',
  PublicKeysAverageHistoryDesc = 'PUBLIC_KEYS_AVERAGE_HISTORY_DESC',
  PublicKeysAverageIdAsc = 'PUBLIC_KEYS_AVERAGE_ID_ASC',
  PublicKeysAverageIdDesc = 'PUBLIC_KEYS_AVERAGE_ID_DESC',
  PublicKeysAverageUncompressedAsc = 'PUBLIC_KEYS_AVERAGE_UNCOMPRESSED_ASC',
  PublicKeysAverageUncompressedDesc = 'PUBLIC_KEYS_AVERAGE_UNCOMPRESSED_DESC',
  PublicKeysCountAsc = 'PUBLIC_KEYS_COUNT_ASC',
  PublicKeysCountDesc = 'PUBLIC_KEYS_COUNT_DESC',
  PublicKeysDistinctCountBlockIdAsc = 'PUBLIC_KEYS_DISTINCT_COUNT_BLOCK_ID_ASC',
  PublicKeysDistinctCountBlockIdDesc = 'PUBLIC_KEYS_DISTINCT_COUNT_BLOCK_ID_DESC',
  PublicKeysDistinctCountCompressedAsc = 'PUBLIC_KEYS_DISTINCT_COUNT_COMPRESSED_ASC',
  PublicKeysDistinctCountCompressedDesc = 'PUBLIC_KEYS_DISTINCT_COUNT_COMPRESSED_DESC',
  PublicKeysDistinctCountHistoryAsc = 'PUBLIC_KEYS_DISTINCT_COUNT_HISTORY_ASC',
  PublicKeysDistinctCountHistoryDesc = 'PUBLIC_KEYS_DISTINCT_COUNT_HISTORY_DESC',
  PublicKeysDistinctCountIdAsc = 'PUBLIC_KEYS_DISTINCT_COUNT_ID_ASC',
  PublicKeysDistinctCountIdDesc = 'PUBLIC_KEYS_DISTINCT_COUNT_ID_DESC',
  PublicKeysDistinctCountUncompressedAsc = 'PUBLIC_KEYS_DISTINCT_COUNT_UNCOMPRESSED_ASC',
  PublicKeysDistinctCountUncompressedDesc = 'PUBLIC_KEYS_DISTINCT_COUNT_UNCOMPRESSED_DESC',
  PublicKeysMaxBlockIdAsc = 'PUBLIC_KEYS_MAX_BLOCK_ID_ASC',
  PublicKeysMaxBlockIdDesc = 'PUBLIC_KEYS_MAX_BLOCK_ID_DESC',
  PublicKeysMaxCompressedAsc = 'PUBLIC_KEYS_MAX_COMPRESSED_ASC',
  PublicKeysMaxCompressedDesc = 'PUBLIC_KEYS_MAX_COMPRESSED_DESC',
  PublicKeysMaxHistoryAsc = 'PUBLIC_KEYS_MAX_HISTORY_ASC',
  PublicKeysMaxHistoryDesc = 'PUBLIC_KEYS_MAX_HISTORY_DESC',
  PublicKeysMaxIdAsc = 'PUBLIC_KEYS_MAX_ID_ASC',
  PublicKeysMaxIdDesc = 'PUBLIC_KEYS_MAX_ID_DESC',
  PublicKeysMaxUncompressedAsc = 'PUBLIC_KEYS_MAX_UNCOMPRESSED_ASC',
  PublicKeysMaxUncompressedDesc = 'PUBLIC_KEYS_MAX_UNCOMPRESSED_DESC',
  PublicKeysMinBlockIdAsc = 'PUBLIC_KEYS_MIN_BLOCK_ID_ASC',
  PublicKeysMinBlockIdDesc = 'PUBLIC_KEYS_MIN_BLOCK_ID_DESC',
  PublicKeysMinCompressedAsc = 'PUBLIC_KEYS_MIN_COMPRESSED_ASC',
  PublicKeysMinCompressedDesc = 'PUBLIC_KEYS_MIN_COMPRESSED_DESC',
  PublicKeysMinHistoryAsc = 'PUBLIC_KEYS_MIN_HISTORY_ASC',
  PublicKeysMinHistoryDesc = 'PUBLIC_KEYS_MIN_HISTORY_DESC',
  PublicKeysMinIdAsc = 'PUBLIC_KEYS_MIN_ID_ASC',
  PublicKeysMinIdDesc = 'PUBLIC_KEYS_MIN_ID_DESC',
  PublicKeysMinUncompressedAsc = 'PUBLIC_KEYS_MIN_UNCOMPRESSED_ASC',
  PublicKeysMinUncompressedDesc = 'PUBLIC_KEYS_MIN_UNCOMPRESSED_DESC',
  PublicKeysStddevPopulationBlockIdAsc = 'PUBLIC_KEYS_STDDEV_POPULATION_BLOCK_ID_ASC',
  PublicKeysStddevPopulationBlockIdDesc = 'PUBLIC_KEYS_STDDEV_POPULATION_BLOCK_ID_DESC',
  PublicKeysStddevPopulationCompressedAsc = 'PUBLIC_KEYS_STDDEV_POPULATION_COMPRESSED_ASC',
  PublicKeysStddevPopulationCompressedDesc = 'PUBLIC_KEYS_STDDEV_POPULATION_COMPRESSED_DESC',
  PublicKeysStddevPopulationHistoryAsc = 'PUBLIC_KEYS_STDDEV_POPULATION_HISTORY_ASC',
  PublicKeysStddevPopulationHistoryDesc = 'PUBLIC_KEYS_STDDEV_POPULATION_HISTORY_DESC',
  PublicKeysStddevPopulationIdAsc = 'PUBLIC_KEYS_STDDEV_POPULATION_ID_ASC',
  PublicKeysStddevPopulationIdDesc = 'PUBLIC_KEYS_STDDEV_POPULATION_ID_DESC',
  PublicKeysStddevPopulationUncompressedAsc = 'PUBLIC_KEYS_STDDEV_POPULATION_UNCOMPRESSED_ASC',
  PublicKeysStddevPopulationUncompressedDesc = 'PUBLIC_KEYS_STDDEV_POPULATION_UNCOMPRESSED_DESC',
  PublicKeysStddevSampleBlockIdAsc = 'PUBLIC_KEYS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  PublicKeysStddevSampleBlockIdDesc = 'PUBLIC_KEYS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  PublicKeysStddevSampleCompressedAsc = 'PUBLIC_KEYS_STDDEV_SAMPLE_COMPRESSED_ASC',
  PublicKeysStddevSampleCompressedDesc = 'PUBLIC_KEYS_STDDEV_SAMPLE_COMPRESSED_DESC',
  PublicKeysStddevSampleHistoryAsc = 'PUBLIC_KEYS_STDDEV_SAMPLE_HISTORY_ASC',
  PublicKeysStddevSampleHistoryDesc = 'PUBLIC_KEYS_STDDEV_SAMPLE_HISTORY_DESC',
  PublicKeysStddevSampleIdAsc = 'PUBLIC_KEYS_STDDEV_SAMPLE_ID_ASC',
  PublicKeysStddevSampleIdDesc = 'PUBLIC_KEYS_STDDEV_SAMPLE_ID_DESC',
  PublicKeysStddevSampleUncompressedAsc = 'PUBLIC_KEYS_STDDEV_SAMPLE_UNCOMPRESSED_ASC',
  PublicKeysStddevSampleUncompressedDesc = 'PUBLIC_KEYS_STDDEV_SAMPLE_UNCOMPRESSED_DESC',
  PublicKeysSumBlockIdAsc = 'PUBLIC_KEYS_SUM_BLOCK_ID_ASC',
  PublicKeysSumBlockIdDesc = 'PUBLIC_KEYS_SUM_BLOCK_ID_DESC',
  PublicKeysSumCompressedAsc = 'PUBLIC_KEYS_SUM_COMPRESSED_ASC',
  PublicKeysSumCompressedDesc = 'PUBLIC_KEYS_SUM_COMPRESSED_DESC',
  PublicKeysSumHistoryAsc = 'PUBLIC_KEYS_SUM_HISTORY_ASC',
  PublicKeysSumHistoryDesc = 'PUBLIC_KEYS_SUM_HISTORY_DESC',
  PublicKeysSumIdAsc = 'PUBLIC_KEYS_SUM_ID_ASC',
  PublicKeysSumIdDesc = 'PUBLIC_KEYS_SUM_ID_DESC',
  PublicKeysSumUncompressedAsc = 'PUBLIC_KEYS_SUM_UNCOMPRESSED_ASC',
  PublicKeysSumUncompressedDesc = 'PUBLIC_KEYS_SUM_UNCOMPRESSED_DESC',
  PublicKeysVariancePopulationBlockIdAsc = 'PUBLIC_KEYS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  PublicKeysVariancePopulationBlockIdDesc = 'PUBLIC_KEYS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  PublicKeysVariancePopulationCompressedAsc = 'PUBLIC_KEYS_VARIANCE_POPULATION_COMPRESSED_ASC',
  PublicKeysVariancePopulationCompressedDesc = 'PUBLIC_KEYS_VARIANCE_POPULATION_COMPRESSED_DESC',
  PublicKeysVariancePopulationHistoryAsc = 'PUBLIC_KEYS_VARIANCE_POPULATION_HISTORY_ASC',
  PublicKeysVariancePopulationHistoryDesc = 'PUBLIC_KEYS_VARIANCE_POPULATION_HISTORY_DESC',
  PublicKeysVariancePopulationIdAsc = 'PUBLIC_KEYS_VARIANCE_POPULATION_ID_ASC',
  PublicKeysVariancePopulationIdDesc = 'PUBLIC_KEYS_VARIANCE_POPULATION_ID_DESC',
  PublicKeysVariancePopulationUncompressedAsc = 'PUBLIC_KEYS_VARIANCE_POPULATION_UNCOMPRESSED_ASC',
  PublicKeysVariancePopulationUncompressedDesc = 'PUBLIC_KEYS_VARIANCE_POPULATION_UNCOMPRESSED_DESC',
  PublicKeysVarianceSampleBlockIdAsc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  PublicKeysVarianceSampleBlockIdDesc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  PublicKeysVarianceSampleCompressedAsc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_COMPRESSED_ASC',
  PublicKeysVarianceSampleCompressedDesc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_COMPRESSED_DESC',
  PublicKeysVarianceSampleHistoryAsc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_HISTORY_ASC',
  PublicKeysVarianceSampleHistoryDesc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_HISTORY_DESC',
  PublicKeysVarianceSampleIdAsc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_ID_ASC',
  PublicKeysVarianceSampleIdDesc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_ID_DESC',
  PublicKeysVarianceSampleUncompressedAsc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_UNCOMPRESSED_ASC',
  PublicKeysVarianceSampleUncompressedDesc = 'PUBLIC_KEYS_VARIANCE_SAMPLE_UNCOMPRESSED_DESC',
  SessionsAverageBlockIdAsc = 'SESSIONS_AVERAGE_BLOCK_ID_ASC',
  SessionsAverageBlockIdDesc = 'SESSIONS_AVERAGE_BLOCK_ID_DESC',
  SessionsAverageBlockNumberAsc = 'SESSIONS_AVERAGE_BLOCK_NUMBER_ASC',
  SessionsAverageBlockNumberDesc = 'SESSIONS_AVERAGE_BLOCK_NUMBER_DESC',
  SessionsAverageIdAsc = 'SESSIONS_AVERAGE_ID_ASC',
  SessionsAverageIdDesc = 'SESSIONS_AVERAGE_ID_DESC',
  SessionsAverageKeyGenThresholdAsc = 'SESSIONS_AVERAGE_KEY_GEN_THRESHOLD_ASC',
  SessionsAverageKeyGenThresholdDesc = 'SESSIONS_AVERAGE_KEY_GEN_THRESHOLD_DESC',
  SessionsAverageProposersAsc = 'SESSIONS_AVERAGE_PROPOSERS_ASC',
  SessionsAverageProposersCountAsc = 'SESSIONS_AVERAGE_PROPOSERS_COUNT_ASC',
  SessionsAverageProposersCountDesc = 'SESSIONS_AVERAGE_PROPOSERS_COUNT_DESC',
  SessionsAverageProposersDesc = 'SESSIONS_AVERAGE_PROPOSERS_DESC',
  SessionsAverageProposerThresholdAsc = 'SESSIONS_AVERAGE_PROPOSER_THRESHOLD_ASC',
  SessionsAverageProposerThresholdDesc = 'SESSIONS_AVERAGE_PROPOSER_THRESHOLD_DESC',
  SessionsAveragePublicKeyIdAsc = 'SESSIONS_AVERAGE_PUBLIC_KEY_ID_ASC',
  SessionsAveragePublicKeyIdDesc = 'SESSIONS_AVERAGE_PUBLIC_KEY_ID_DESC',
  SessionsAverageSignatureThresholdAsc = 'SESSIONS_AVERAGE_SIGNATURE_THRESHOLD_ASC',
  SessionsAverageSignatureThresholdDesc = 'SESSIONS_AVERAGE_SIGNATURE_THRESHOLD_DESC',
  SessionsCountAsc = 'SESSIONS_COUNT_ASC',
  SessionsCountDesc = 'SESSIONS_COUNT_DESC',
  SessionsDistinctCountBlockIdAsc = 'SESSIONS_DISTINCT_COUNT_BLOCK_ID_ASC',
  SessionsDistinctCountBlockIdDesc = 'SESSIONS_DISTINCT_COUNT_BLOCK_ID_DESC',
  SessionsDistinctCountBlockNumberAsc = 'SESSIONS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  SessionsDistinctCountBlockNumberDesc = 'SESSIONS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  SessionsDistinctCountIdAsc = 'SESSIONS_DISTINCT_COUNT_ID_ASC',
  SessionsDistinctCountIdDesc = 'SESSIONS_DISTINCT_COUNT_ID_DESC',
  SessionsDistinctCountKeyGenThresholdAsc = 'SESSIONS_DISTINCT_COUNT_KEY_GEN_THRESHOLD_ASC',
  SessionsDistinctCountKeyGenThresholdDesc = 'SESSIONS_DISTINCT_COUNT_KEY_GEN_THRESHOLD_DESC',
  SessionsDistinctCountProposersAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_ASC',
  SessionsDistinctCountProposersCountAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_COUNT_ASC',
  SessionsDistinctCountProposersCountDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_COUNT_DESC',
  SessionsDistinctCountProposersDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_DESC',
  SessionsDistinctCountProposerThresholdAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSER_THRESHOLD_ASC',
  SessionsDistinctCountProposerThresholdDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSER_THRESHOLD_DESC',
  SessionsDistinctCountPublicKeyIdAsc = 'SESSIONS_DISTINCT_COUNT_PUBLIC_KEY_ID_ASC',
  SessionsDistinctCountPublicKeyIdDesc = 'SESSIONS_DISTINCT_COUNT_PUBLIC_KEY_ID_DESC',
  SessionsDistinctCountSignatureThresholdAsc = 'SESSIONS_DISTINCT_COUNT_SIGNATURE_THRESHOLD_ASC',
  SessionsDistinctCountSignatureThresholdDesc = 'SESSIONS_DISTINCT_COUNT_SIGNATURE_THRESHOLD_DESC',
  SessionsMaxBlockIdAsc = 'SESSIONS_MAX_BLOCK_ID_ASC',
  SessionsMaxBlockIdDesc = 'SESSIONS_MAX_BLOCK_ID_DESC',
  SessionsMaxBlockNumberAsc = 'SESSIONS_MAX_BLOCK_NUMBER_ASC',
  SessionsMaxBlockNumberDesc = 'SESSIONS_MAX_BLOCK_NUMBER_DESC',
  SessionsMaxIdAsc = 'SESSIONS_MAX_ID_ASC',
  SessionsMaxIdDesc = 'SESSIONS_MAX_ID_DESC',
  SessionsMaxKeyGenThresholdAsc = 'SESSIONS_MAX_KEY_GEN_THRESHOLD_ASC',
  SessionsMaxKeyGenThresholdDesc = 'SESSIONS_MAX_KEY_GEN_THRESHOLD_DESC',
  SessionsMaxProposersAsc = 'SESSIONS_MAX_PROPOSERS_ASC',
  SessionsMaxProposersCountAsc = 'SESSIONS_MAX_PROPOSERS_COUNT_ASC',
  SessionsMaxProposersCountDesc = 'SESSIONS_MAX_PROPOSERS_COUNT_DESC',
  SessionsMaxProposersDesc = 'SESSIONS_MAX_PROPOSERS_DESC',
  SessionsMaxProposerThresholdAsc = 'SESSIONS_MAX_PROPOSER_THRESHOLD_ASC',
  SessionsMaxProposerThresholdDesc = 'SESSIONS_MAX_PROPOSER_THRESHOLD_DESC',
  SessionsMaxPublicKeyIdAsc = 'SESSIONS_MAX_PUBLIC_KEY_ID_ASC',
  SessionsMaxPublicKeyIdDesc = 'SESSIONS_MAX_PUBLIC_KEY_ID_DESC',
  SessionsMaxSignatureThresholdAsc = 'SESSIONS_MAX_SIGNATURE_THRESHOLD_ASC',
  SessionsMaxSignatureThresholdDesc = 'SESSIONS_MAX_SIGNATURE_THRESHOLD_DESC',
  SessionsMinBlockIdAsc = 'SESSIONS_MIN_BLOCK_ID_ASC',
  SessionsMinBlockIdDesc = 'SESSIONS_MIN_BLOCK_ID_DESC',
  SessionsMinBlockNumberAsc = 'SESSIONS_MIN_BLOCK_NUMBER_ASC',
  SessionsMinBlockNumberDesc = 'SESSIONS_MIN_BLOCK_NUMBER_DESC',
  SessionsMinIdAsc = 'SESSIONS_MIN_ID_ASC',
  SessionsMinIdDesc = 'SESSIONS_MIN_ID_DESC',
  SessionsMinKeyGenThresholdAsc = 'SESSIONS_MIN_KEY_GEN_THRESHOLD_ASC',
  SessionsMinKeyGenThresholdDesc = 'SESSIONS_MIN_KEY_GEN_THRESHOLD_DESC',
  SessionsMinProposersAsc = 'SESSIONS_MIN_PROPOSERS_ASC',
  SessionsMinProposersCountAsc = 'SESSIONS_MIN_PROPOSERS_COUNT_ASC',
  SessionsMinProposersCountDesc = 'SESSIONS_MIN_PROPOSERS_COUNT_DESC',
  SessionsMinProposersDesc = 'SESSIONS_MIN_PROPOSERS_DESC',
  SessionsMinProposerThresholdAsc = 'SESSIONS_MIN_PROPOSER_THRESHOLD_ASC',
  SessionsMinProposerThresholdDesc = 'SESSIONS_MIN_PROPOSER_THRESHOLD_DESC',
  SessionsMinPublicKeyIdAsc = 'SESSIONS_MIN_PUBLIC_KEY_ID_ASC',
  SessionsMinPublicKeyIdDesc = 'SESSIONS_MIN_PUBLIC_KEY_ID_DESC',
  SessionsMinSignatureThresholdAsc = 'SESSIONS_MIN_SIGNATURE_THRESHOLD_ASC',
  SessionsMinSignatureThresholdDesc = 'SESSIONS_MIN_SIGNATURE_THRESHOLD_DESC',
  SessionsStddevPopulationBlockIdAsc = 'SESSIONS_STDDEV_POPULATION_BLOCK_ID_ASC',
  SessionsStddevPopulationBlockIdDesc = 'SESSIONS_STDDEV_POPULATION_BLOCK_ID_DESC',
  SessionsStddevPopulationBlockNumberAsc = 'SESSIONS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  SessionsStddevPopulationBlockNumberDesc = 'SESSIONS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  SessionsStddevPopulationIdAsc = 'SESSIONS_STDDEV_POPULATION_ID_ASC',
  SessionsStddevPopulationIdDesc = 'SESSIONS_STDDEV_POPULATION_ID_DESC',
  SessionsStddevPopulationKeyGenThresholdAsc = 'SESSIONS_STDDEV_POPULATION_KEY_GEN_THRESHOLD_ASC',
  SessionsStddevPopulationKeyGenThresholdDesc = 'SESSIONS_STDDEV_POPULATION_KEY_GEN_THRESHOLD_DESC',
  SessionsStddevPopulationProposersAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_ASC',
  SessionsStddevPopulationProposersCountAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_COUNT_ASC',
  SessionsStddevPopulationProposersCountDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_COUNT_DESC',
  SessionsStddevPopulationProposersDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_DESC',
  SessionsStddevPopulationProposerThresholdAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSER_THRESHOLD_ASC',
  SessionsStddevPopulationProposerThresholdDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSER_THRESHOLD_DESC',
  SessionsStddevPopulationPublicKeyIdAsc = 'SESSIONS_STDDEV_POPULATION_PUBLIC_KEY_ID_ASC',
  SessionsStddevPopulationPublicKeyIdDesc = 'SESSIONS_STDDEV_POPULATION_PUBLIC_KEY_ID_DESC',
  SessionsStddevPopulationSignatureThresholdAsc = 'SESSIONS_STDDEV_POPULATION_SIGNATURE_THRESHOLD_ASC',
  SessionsStddevPopulationSignatureThresholdDesc = 'SESSIONS_STDDEV_POPULATION_SIGNATURE_THRESHOLD_DESC',
  SessionsStddevSampleBlockIdAsc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  SessionsStddevSampleBlockIdDesc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  SessionsStddevSampleBlockNumberAsc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  SessionsStddevSampleBlockNumberDesc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  SessionsStddevSampleIdAsc = 'SESSIONS_STDDEV_SAMPLE_ID_ASC',
  SessionsStddevSampleIdDesc = 'SESSIONS_STDDEV_SAMPLE_ID_DESC',
  SessionsStddevSampleKeyGenThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_KEY_GEN_THRESHOLD_ASC',
  SessionsStddevSampleKeyGenThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_KEY_GEN_THRESHOLD_DESC',
  SessionsStddevSampleProposersAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_ASC',
  SessionsStddevSampleProposersCountAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_COUNT_ASC',
  SessionsStddevSampleProposersCountDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_COUNT_DESC',
  SessionsStddevSampleProposersDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_DESC',
  SessionsStddevSampleProposerThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSER_THRESHOLD_ASC',
  SessionsStddevSampleProposerThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSER_THRESHOLD_DESC',
  SessionsStddevSamplePublicKeyIdAsc = 'SESSIONS_STDDEV_SAMPLE_PUBLIC_KEY_ID_ASC',
  SessionsStddevSamplePublicKeyIdDesc = 'SESSIONS_STDDEV_SAMPLE_PUBLIC_KEY_ID_DESC',
  SessionsStddevSampleSignatureThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_SIGNATURE_THRESHOLD_ASC',
  SessionsStddevSampleSignatureThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_SIGNATURE_THRESHOLD_DESC',
  SessionsSumBlockIdAsc = 'SESSIONS_SUM_BLOCK_ID_ASC',
  SessionsSumBlockIdDesc = 'SESSIONS_SUM_BLOCK_ID_DESC',
  SessionsSumBlockNumberAsc = 'SESSIONS_SUM_BLOCK_NUMBER_ASC',
  SessionsSumBlockNumberDesc = 'SESSIONS_SUM_BLOCK_NUMBER_DESC',
  SessionsSumIdAsc = 'SESSIONS_SUM_ID_ASC',
  SessionsSumIdDesc = 'SESSIONS_SUM_ID_DESC',
  SessionsSumKeyGenThresholdAsc = 'SESSIONS_SUM_KEY_GEN_THRESHOLD_ASC',
  SessionsSumKeyGenThresholdDesc = 'SESSIONS_SUM_KEY_GEN_THRESHOLD_DESC',
  SessionsSumProposersAsc = 'SESSIONS_SUM_PROPOSERS_ASC',
  SessionsSumProposersCountAsc = 'SESSIONS_SUM_PROPOSERS_COUNT_ASC',
  SessionsSumProposersCountDesc = 'SESSIONS_SUM_PROPOSERS_COUNT_DESC',
  SessionsSumProposersDesc = 'SESSIONS_SUM_PROPOSERS_DESC',
  SessionsSumProposerThresholdAsc = 'SESSIONS_SUM_PROPOSER_THRESHOLD_ASC',
  SessionsSumProposerThresholdDesc = 'SESSIONS_SUM_PROPOSER_THRESHOLD_DESC',
  SessionsSumPublicKeyIdAsc = 'SESSIONS_SUM_PUBLIC_KEY_ID_ASC',
  SessionsSumPublicKeyIdDesc = 'SESSIONS_SUM_PUBLIC_KEY_ID_DESC',
  SessionsSumSignatureThresholdAsc = 'SESSIONS_SUM_SIGNATURE_THRESHOLD_ASC',
  SessionsSumSignatureThresholdDesc = 'SESSIONS_SUM_SIGNATURE_THRESHOLD_DESC',
  SessionsVariancePopulationBlockIdAsc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  SessionsVariancePopulationBlockIdDesc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  SessionsVariancePopulationBlockNumberAsc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  SessionsVariancePopulationBlockNumberDesc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  SessionsVariancePopulationIdAsc = 'SESSIONS_VARIANCE_POPULATION_ID_ASC',
  SessionsVariancePopulationIdDesc = 'SESSIONS_VARIANCE_POPULATION_ID_DESC',
  SessionsVariancePopulationKeyGenThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_KEY_GEN_THRESHOLD_ASC',
  SessionsVariancePopulationKeyGenThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_KEY_GEN_THRESHOLD_DESC',
  SessionsVariancePopulationProposersAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_ASC',
  SessionsVariancePopulationProposersCountAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_COUNT_ASC',
  SessionsVariancePopulationProposersCountDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_COUNT_DESC',
  SessionsVariancePopulationProposersDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_DESC',
  SessionsVariancePopulationProposerThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSER_THRESHOLD_ASC',
  SessionsVariancePopulationProposerThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSER_THRESHOLD_DESC',
  SessionsVariancePopulationPublicKeyIdAsc = 'SESSIONS_VARIANCE_POPULATION_PUBLIC_KEY_ID_ASC',
  SessionsVariancePopulationPublicKeyIdDesc = 'SESSIONS_VARIANCE_POPULATION_PUBLIC_KEY_ID_DESC',
  SessionsVariancePopulationSignatureThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_SIGNATURE_THRESHOLD_ASC',
  SessionsVariancePopulationSignatureThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_SIGNATURE_THRESHOLD_DESC',
  SessionsVarianceSampleBlockIdAsc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  SessionsVarianceSampleBlockIdDesc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  SessionsVarianceSampleBlockNumberAsc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  SessionsVarianceSampleBlockNumberDesc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  SessionsVarianceSampleIdAsc = 'SESSIONS_VARIANCE_SAMPLE_ID_ASC',
  SessionsVarianceSampleIdDesc = 'SESSIONS_VARIANCE_SAMPLE_ID_DESC',
  SessionsVarianceSampleKeyGenThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_KEY_GEN_THRESHOLD_ASC',
  SessionsVarianceSampleKeyGenThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_KEY_GEN_THRESHOLD_DESC',
  SessionsVarianceSampleProposersAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_ASC',
  SessionsVarianceSampleProposersCountAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_COUNT_ASC',
  SessionsVarianceSampleProposersCountDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_COUNT_DESC',
  SessionsVarianceSampleProposersDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_DESC',
  SessionsVarianceSampleProposerThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSER_THRESHOLD_ASC',
  SessionsVarianceSampleProposerThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSER_THRESHOLD_DESC',
  SessionsVarianceSamplePublicKeyIdAsc = 'SESSIONS_VARIANCE_SAMPLE_PUBLIC_KEY_ID_ASC',
  SessionsVarianceSamplePublicKeyIdDesc = 'SESSIONS_VARIANCE_SAMPLE_PUBLIC_KEY_ID_DESC',
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
  UnsignedProposalsQueuesAverageBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_AVERAGE_BLOCK_ID_ASC',
  UnsignedProposalsQueuesAverageBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_AVERAGE_BLOCK_ID_DESC',
  UnsignedProposalsQueuesAverageBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_AVERAGE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesAverageBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_AVERAGE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesAverageIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_AVERAGE_ID_ASC',
  UnsignedProposalsQueuesAverageIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_AVERAGE_ID_DESC',
  UnsignedProposalsQueuesCountAsc = 'UNSIGNED_PROPOSALS_QUEUES_COUNT_ASC',
  UnsignedProposalsQueuesCountDesc = 'UNSIGNED_PROPOSALS_QUEUES_COUNT_DESC',
  UnsignedProposalsQueuesDistinctCountBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_DISTINCT_COUNT_BLOCK_ID_ASC',
  UnsignedProposalsQueuesDistinctCountBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_DISTINCT_COUNT_BLOCK_ID_DESC',
  UnsignedProposalsQueuesDistinctCountBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesDistinctCountBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesDistinctCountIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_DISTINCT_COUNT_ID_ASC',
  UnsignedProposalsQueuesDistinctCountIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_DISTINCT_COUNT_ID_DESC',
  UnsignedProposalsQueuesMaxBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_MAX_BLOCK_ID_ASC',
  UnsignedProposalsQueuesMaxBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_MAX_BLOCK_ID_DESC',
  UnsignedProposalsQueuesMaxBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_MAX_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesMaxBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_MAX_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesMaxIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_MAX_ID_ASC',
  UnsignedProposalsQueuesMaxIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_MAX_ID_DESC',
  UnsignedProposalsQueuesMinBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_MIN_BLOCK_ID_ASC',
  UnsignedProposalsQueuesMinBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_MIN_BLOCK_ID_DESC',
  UnsignedProposalsQueuesMinBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_MIN_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesMinBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_MIN_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesMinIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_MIN_ID_ASC',
  UnsignedProposalsQueuesMinIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_MIN_ID_DESC',
  UnsignedProposalsQueuesStddevPopulationBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_POPULATION_BLOCK_ID_ASC',
  UnsignedProposalsQueuesStddevPopulationBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_POPULATION_BLOCK_ID_DESC',
  UnsignedProposalsQueuesStddevPopulationBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesStddevPopulationBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesStddevPopulationIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_POPULATION_ID_ASC',
  UnsignedProposalsQueuesStddevPopulationIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_POPULATION_ID_DESC',
  UnsignedProposalsQueuesStddevSampleBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_SAMPLE_BLOCK_ID_ASC',
  UnsignedProposalsQueuesStddevSampleBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_SAMPLE_BLOCK_ID_DESC',
  UnsignedProposalsQueuesStddevSampleBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesStddevSampleBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesStddevSampleIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_SAMPLE_ID_ASC',
  UnsignedProposalsQueuesStddevSampleIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_STDDEV_SAMPLE_ID_DESC',
  UnsignedProposalsQueuesSumBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_SUM_BLOCK_ID_ASC',
  UnsignedProposalsQueuesSumBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_SUM_BLOCK_ID_DESC',
  UnsignedProposalsQueuesSumBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_SUM_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesSumBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_SUM_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesSumIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_SUM_ID_ASC',
  UnsignedProposalsQueuesSumIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_SUM_ID_DESC',
  UnsignedProposalsQueuesVariancePopulationBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_POPULATION_BLOCK_ID_ASC',
  UnsignedProposalsQueuesVariancePopulationBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_POPULATION_BLOCK_ID_DESC',
  UnsignedProposalsQueuesVariancePopulationBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesVariancePopulationBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesVariancePopulationIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_POPULATION_ID_ASC',
  UnsignedProposalsQueuesVariancePopulationIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_POPULATION_ID_DESC',
  UnsignedProposalsQueuesVarianceSampleBlockIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  UnsignedProposalsQueuesVarianceSampleBlockIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  UnsignedProposalsQueuesVarianceSampleBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueuesVarianceSampleBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueuesVarianceSampleIdAsc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_SAMPLE_ID_ASC',
  UnsignedProposalsQueuesVarianceSampleIdDesc = 'UNSIGNED_PROPOSALS_QUEUES_VARIANCE_SAMPLE_ID_DESC',
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

export type ProposalCounter = Node & {
  __typename?: 'ProposalCounter';
  /** Reads a single `Block` that is related to this `ProposalCounter`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  blockNumber: Scalars['Int'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  signedProposalsCount: Scalars['Int'];
  signedProposalsMap?: Maybe<Scalars['JSON']>;
  statusMap?: Maybe<Scalars['JSON']>;
  unSignedProposalsCount: Scalars['Int'];
  unSignedProposalsMap?: Maybe<Scalars['JSON']>;
};

export type ProposalCounterAggregates = {
  __typename?: 'ProposalCounterAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<ProposalCounterAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<ProposalCounterDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<ProposalCounterMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<ProposalCounterMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<ProposalCounterStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<ProposalCounterStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<ProposalCounterSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<ProposalCounterVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<ProposalCounterVarianceSampleAggregates>;
};

export type ProposalCounterAverageAggregates = {
  __typename?: 'ProposalCounterAverageAggregates';
  /** Mean average of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Mean average of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['BigFloat']>;
  /** Mean average of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['BigFloat']>;
};

export type ProposalCounterDistinctCountAggregates = {
  __typename?: 'ProposalCounterDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['BigInt']>;
  /** Distinct count of signedProposalsMap across the matching connection */
  signedProposalsMap?: Maybe<Scalars['BigInt']>;
  /** Distinct count of statusMap across the matching connection */
  statusMap?: Maybe<Scalars['BigInt']>;
  /** Distinct count of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['BigInt']>;
  /** Distinct count of unSignedProposalsMap across the matching connection */
  unSignedProposalsMap?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `ProposalCounter` object types. All fields are combined with a logical ‘and.’ */
export type ProposalCounterFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ProposalCounterFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ProposalCounterFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ProposalCounterFilter>>;
  /** Filter by the object’s `signedProposalsCount` field. */
  signedProposalsCount?: InputMaybe<IntFilter>;
  /** Filter by the object’s `signedProposalsMap` field. */
  signedProposalsMap?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `statusMap` field. */
  statusMap?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `unSignedProposalsCount` field. */
  unSignedProposalsCount?: InputMaybe<IntFilter>;
  /** Filter by the object’s `unSignedProposalsMap` field. */
  unSignedProposalsMap?: InputMaybe<JsonFilter>;
};

export type ProposalCounterMaxAggregates = {
  __typename?: 'ProposalCounterMaxAggregates';
  /** Maximum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
  /** Maximum of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['Int']>;
  /** Maximum of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['Int']>;
};

export type ProposalCounterMinAggregates = {
  __typename?: 'ProposalCounterMinAggregates';
  /** Minimum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
  /** Minimum of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['Int']>;
  /** Minimum of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['Int']>;
};

export type ProposalCounterStddevPopulationAggregates = {
  __typename?: 'ProposalCounterStddevPopulationAggregates';
  /** Population standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['BigFloat']>;
};

export type ProposalCounterStddevSampleAggregates = {
  __typename?: 'ProposalCounterStddevSampleAggregates';
  /** Sample standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['BigFloat']>;
};

export type ProposalCounterSumAggregates = {
  __typename?: 'ProposalCounterSumAggregates';
  /** Sum of blockNumber across the matching connection */
  blockNumber: Scalars['BigInt'];
  /** Sum of signedProposalsCount across the matching connection */
  signedProposalsCount: Scalars['BigInt'];
  /** Sum of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount: Scalars['BigInt'];
};

export type ProposalCounterVariancePopulationAggregates = {
  __typename?: 'ProposalCounterVariancePopulationAggregates';
  /** Population variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population variance of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['BigFloat']>;
  /** Population variance of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['BigFloat']>;
};

export type ProposalCounterVarianceSampleAggregates = {
  __typename?: 'ProposalCounterVarianceSampleAggregates';
  /** Sample variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of signedProposalsCount across the matching connection */
  signedProposalsCount?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of unSignedProposalsCount across the matching connection */
  unSignedProposalsCount?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `ProposalCounter` values. */
export type ProposalCountersConnection = {
  __typename?: 'ProposalCountersConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposalCounterAggregates>;
  /** A list of edges which contains the `ProposalCounter` and cursor to aid in pagination. */
  edges: Array<ProposalCountersEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposalCounterAggregates>>;
  /** A list of `ProposalCounter` objects. */
  nodes: Array<Maybe<ProposalCounter>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `ProposalCounter` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `ProposalCounter` values. */
export type ProposalCountersConnectionGroupedAggregatesArgs = {
  groupBy: Array<ProposalCountersGroupBy>;
  having?: InputMaybe<ProposalCountersHavingInput>;
};

/** A `ProposalCounter` edge in the connection. */
export type ProposalCountersEdge = {
  __typename?: 'ProposalCountersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ProposalCounter` at the end of the edge. */
  node?: Maybe<ProposalCounter>;
};

/** Grouping methods for `ProposalCounter` for usage during aggregation. */
export enum ProposalCountersGroupBy {
  BlockId = 'BLOCK_ID',
  BlockNumber = 'BLOCK_NUMBER',
  SignedProposalsCount = 'SIGNED_PROPOSALS_COUNT',
  SignedProposalsMap = 'SIGNED_PROPOSALS_MAP',
  StatusMap = 'STATUS_MAP',
  UnSignedProposalsCount = 'UN_SIGNED_PROPOSALS_COUNT',
  UnSignedProposalsMap = 'UN_SIGNED_PROPOSALS_MAP',
}

export type ProposalCountersHavingAverageInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

export type ProposalCountersHavingDistinctCountInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `ProposalCounter` aggregates. */
export type ProposalCountersHavingInput = {
  AND?: InputMaybe<Array<ProposalCountersHavingInput>>;
  OR?: InputMaybe<Array<ProposalCountersHavingInput>>;
  average?: InputMaybe<ProposalCountersHavingAverageInput>;
  distinctCount?: InputMaybe<ProposalCountersHavingDistinctCountInput>;
  max?: InputMaybe<ProposalCountersHavingMaxInput>;
  min?: InputMaybe<ProposalCountersHavingMinInput>;
  stddevPopulation?: InputMaybe<ProposalCountersHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<ProposalCountersHavingStddevSampleInput>;
  sum?: InputMaybe<ProposalCountersHavingSumInput>;
  variancePopulation?: InputMaybe<ProposalCountersHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<ProposalCountersHavingVarianceSampleInput>;
};

export type ProposalCountersHavingMaxInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

export type ProposalCountersHavingMinInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

export type ProposalCountersHavingStddevPopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

export type ProposalCountersHavingStddevSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

export type ProposalCountersHavingSumInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

export type ProposalCountersHavingVariancePopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

export type ProposalCountersHavingVarianceSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  signedProposalsCount?: InputMaybe<HavingIntFilter>;
  unSignedProposalsCount?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `ProposalCounter`. */
export enum ProposalCountersOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SignedProposalsCountAsc = 'SIGNED_PROPOSALS_COUNT_ASC',
  SignedProposalsCountDesc = 'SIGNED_PROPOSALS_COUNT_DESC',
  SignedProposalsMapAsc = 'SIGNED_PROPOSALS_MAP_ASC',
  SignedProposalsMapDesc = 'SIGNED_PROPOSALS_MAP_DESC',
  StatusMapAsc = 'STATUS_MAP_ASC',
  StatusMapDesc = 'STATUS_MAP_DESC',
  UnSignedProposalsCountAsc = 'UN_SIGNED_PROPOSALS_COUNT_ASC',
  UnSignedProposalsCountDesc = 'UN_SIGNED_PROPOSALS_COUNT_DESC',
  UnSignedProposalsMapAsc = 'UN_SIGNED_PROPOSALS_MAP_ASC',
  UnSignedProposalsMapDesc = 'UN_SIGNED_PROPOSALS_MAP_DESC',
}

export type ProposalItem = Node & {
  __typename?: 'ProposalItem';
  /** Reads a single `Block` that is related to this `ProposalItem`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  blockNumber: Scalars['Int'];
  currentStatus: Scalars['JSON'];
  data: Scalars['String'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  nonce: Scalars['Int'];
  removed?: Maybe<Scalars['Boolean']>;
  signature?: Maybe<Scalars['String']>;
  status: Scalars['String'];
  timelineStatus: Scalars['JSON'];
  type: ProposalType;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueueItem`. */
  unsignedProposalsQueueItemsByProposalId: UnsignedProposalsQueueItemsConnection;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueue`. */
  unsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueId: ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyConnection;
  votes: Scalars['JSON'];
};

export type ProposalItemUnsignedProposalsQueueItemsByProposalIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<UnsignedProposalsQueueItemFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<UnsignedProposalsQueueItemsOrderBy>>;
};

export type ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<UnsignedProposalsQueueFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<UnsignedProposalsQueuesOrderBy>>;
};

export type ProposalItemAggregates = {
  __typename?: 'ProposalItemAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<ProposalItemAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<ProposalItemDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<ProposalItemMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<ProposalItemMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<ProposalItemStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<ProposalItemStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<ProposalItemSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<ProposalItemVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<ProposalItemVarianceSampleAggregates>;
};

export type ProposalItemAverageAggregates = {
  __typename?: 'ProposalItemAverageAggregates';
  /** Mean average of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Mean average of nonce across the matching connection */
  nonce?: Maybe<Scalars['BigFloat']>;
};

export type ProposalItemDistinctCountAggregates = {
  __typename?: 'ProposalItemDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of currentStatus across the matching connection */
  currentStatus?: Maybe<Scalars['BigInt']>;
  /** Distinct count of data across the matching connection */
  data?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of nonce across the matching connection */
  nonce?: Maybe<Scalars['BigInt']>;
  /** Distinct count of removed across the matching connection */
  removed?: Maybe<Scalars['BigInt']>;
  /** Distinct count of signature across the matching connection */
  signature?: Maybe<Scalars['BigInt']>;
  /** Distinct count of status across the matching connection */
  status?: Maybe<Scalars['BigInt']>;
  /** Distinct count of timelineStatus across the matching connection */
  timelineStatus?: Maybe<Scalars['BigInt']>;
  /** Distinct count of type across the matching connection */
  type?: Maybe<Scalars['BigInt']>;
  /** Distinct count of votes across the matching connection */
  votes?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `ProposalItem` object types. All fields are combined with a logical ‘and.’ */
export type ProposalItemFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ProposalItemFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<IntFilter>;
  /** Filter by the object’s `currentStatus` field. */
  currentStatus?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `data` field. */
  data?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `nonce` field. */
  nonce?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ProposalItemFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ProposalItemFilter>>;
  /** Filter by the object’s `removed` field. */
  removed?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `signature` field. */
  signature?: InputMaybe<StringFilter>;
  /** Filter by the object’s `status` field. */
  status?: InputMaybe<StringFilter>;
  /** Filter by the object’s `timelineStatus` field. */
  timelineStatus?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `type` field. */
  type?: InputMaybe<ProposalTypeFilter>;
  /** Filter by the object’s `votes` field. */
  votes?: InputMaybe<JsonFilter>;
};

export type ProposalItemMaxAggregates = {
  __typename?: 'ProposalItemMaxAggregates';
  /** Maximum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
  /** Maximum of nonce across the matching connection */
  nonce?: Maybe<Scalars['Int']>;
};

export type ProposalItemMinAggregates = {
  __typename?: 'ProposalItemMinAggregates';
  /** Minimum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
  /** Minimum of nonce across the matching connection */
  nonce?: Maybe<Scalars['Int']>;
};

export type ProposalItemStddevPopulationAggregates = {
  __typename?: 'ProposalItemStddevPopulationAggregates';
  /** Population standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of nonce across the matching connection */
  nonce?: Maybe<Scalars['BigFloat']>;
};

export type ProposalItemStddevSampleAggregates = {
  __typename?: 'ProposalItemStddevSampleAggregates';
  /** Sample standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of nonce across the matching connection */
  nonce?: Maybe<Scalars['BigFloat']>;
};

export type ProposalItemSumAggregates = {
  __typename?: 'ProposalItemSumAggregates';
  /** Sum of blockNumber across the matching connection */
  blockNumber: Scalars['BigInt'];
  /** Sum of nonce across the matching connection */
  nonce: Scalars['BigInt'];
};

/** A connection to a list of `UnsignedProposalsQueue` values, with data from `UnsignedProposalsQueueItem`. */
export type ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyConnection = {
  __typename?: 'ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<UnsignedProposalsQueueAggregates>;
  /** A list of edges which contains the `UnsignedProposalsQueue`, info from the `UnsignedProposalsQueueItem`, and the cursor to aid in pagination. */
  edges: Array<ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<UnsignedProposalsQueueAggregates>>;
  /** A list of `UnsignedProposalsQueue` objects. */
  nodes: Array<Maybe<UnsignedProposalsQueue>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `UnsignedProposalsQueue` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `UnsignedProposalsQueue` values, with data from `UnsignedProposalsQueueItem`. */
export type ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<UnsignedProposalsQueuesGroupBy>;
    having?: InputMaybe<UnsignedProposalsQueuesHavingInput>;
  };

/** A `UnsignedProposalsQueue` edge in the connection, with data from `UnsignedProposalsQueueItem`. */
export type ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyEdge = {
  __typename?: 'ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `UnsignedProposalsQueue` at the end of the edge. */
  node?: Maybe<UnsignedProposalsQueue>;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueueItem`. */
  unsignedProposalsQueueItemsByQueueId: UnsignedProposalsQueueItemsConnection;
};

/** A `UnsignedProposalsQueue` edge in the connection, with data from `UnsignedProposalsQueueItem`. */
export type ProposalItemUnsignedProposalsQueuesByUnsignedProposalsQueueItemProposalIdAndQueueIdManyToManyEdgeUnsignedProposalsQueueItemsByQueueIdArgs =
  {
    after?: InputMaybe<Scalars['Cursor']>;
    before?: InputMaybe<Scalars['Cursor']>;
    filter?: InputMaybe<UnsignedProposalsQueueItemFilter>;
    first?: InputMaybe<Scalars['Int']>;
    last?: InputMaybe<Scalars['Int']>;
    offset?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Array<UnsignedProposalsQueueItemsOrderBy>>;
  };

export type ProposalItemVariancePopulationAggregates = {
  __typename?: 'ProposalItemVariancePopulationAggregates';
  /** Population variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Population variance of nonce across the matching connection */
  nonce?: Maybe<Scalars['BigFloat']>;
};

export type ProposalItemVarianceSampleAggregates = {
  __typename?: 'ProposalItemVarianceSampleAggregates';
  /** Sample variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of nonce across the matching connection */
  nonce?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `ProposalItem` values. */
export type ProposalItemsConnection = {
  __typename?: 'ProposalItemsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposalItemAggregates>;
  /** A list of edges which contains the `ProposalItem` and cursor to aid in pagination. */
  edges: Array<ProposalItemsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposalItemAggregates>>;
  /** A list of `ProposalItem` objects. */
  nodes: Array<Maybe<ProposalItem>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `ProposalItem` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `ProposalItem` values. */
export type ProposalItemsConnectionGroupedAggregatesArgs = {
  groupBy: Array<ProposalItemsGroupBy>;
  having?: InputMaybe<ProposalItemsHavingInput>;
};

/** A `ProposalItem` edge in the connection. */
export type ProposalItemsEdge = {
  __typename?: 'ProposalItemsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ProposalItem` at the end of the edge. */
  node?: Maybe<ProposalItem>;
};

/** Grouping methods for `ProposalItem` for usage during aggregation. */
export enum ProposalItemsGroupBy {
  BlockId = 'BLOCK_ID',
  BlockNumber = 'BLOCK_NUMBER',
  CurrentStatus = 'CURRENT_STATUS',
  Data = 'DATA',
  Nonce = 'NONCE',
  Removed = 'REMOVED',
  Signature = 'SIGNATURE',
  Status = 'STATUS',
  TimelineStatus = 'TIMELINE_STATUS',
  Type = 'TYPE',
  Votes = 'VOTES',
}

export type ProposalItemsHavingAverageInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

export type ProposalItemsHavingDistinctCountInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `ProposalItem` aggregates. */
export type ProposalItemsHavingInput = {
  AND?: InputMaybe<Array<ProposalItemsHavingInput>>;
  OR?: InputMaybe<Array<ProposalItemsHavingInput>>;
  average?: InputMaybe<ProposalItemsHavingAverageInput>;
  distinctCount?: InputMaybe<ProposalItemsHavingDistinctCountInput>;
  max?: InputMaybe<ProposalItemsHavingMaxInput>;
  min?: InputMaybe<ProposalItemsHavingMinInput>;
  stddevPopulation?: InputMaybe<ProposalItemsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<ProposalItemsHavingStddevSampleInput>;
  sum?: InputMaybe<ProposalItemsHavingSumInput>;
  variancePopulation?: InputMaybe<ProposalItemsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<ProposalItemsHavingVarianceSampleInput>;
};

export type ProposalItemsHavingMaxInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

export type ProposalItemsHavingMinInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

export type ProposalItemsHavingStddevPopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

export type ProposalItemsHavingStddevSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

export type ProposalItemsHavingSumInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

export type ProposalItemsHavingVariancePopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

export type ProposalItemsHavingVarianceSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
  nonce?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `ProposalItem`. */
export enum ProposalItemsOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  CurrentStatusAsc = 'CURRENT_STATUS_ASC',
  CurrentStatusDesc = 'CURRENT_STATUS_DESC',
  DataAsc = 'DATA_ASC',
  DataDesc = 'DATA_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  NonceAsc = 'NONCE_ASC',
  NonceDesc = 'NONCE_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  RemovedAsc = 'REMOVED_ASC',
  RemovedDesc = 'REMOVED_DESC',
  SignatureAsc = 'SIGNATURE_ASC',
  SignatureDesc = 'SIGNATURE_DESC',
  StatusAsc = 'STATUS_ASC',
  StatusDesc = 'STATUS_DESC',
  TimelineStatusAsc = 'TIMELINE_STATUS_ASC',
  TimelineStatusDesc = 'TIMELINE_STATUS_DESC',
  TypeAsc = 'TYPE_ASC',
  TypeDesc = 'TYPE_DESC',
  UnsignedProposalsQueueItemsByProposalIdAverageBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdAverageBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdAverageIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdAverageIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdAverageProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdAverageProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdAverageQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdAverageQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_AVERAGE_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdCountAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_COUNT_ASC',
  UnsignedProposalsQueueItemsByProposalIdCountDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_COUNT_DESC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdDistinctCountQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_DISTINCT_COUNT_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdMaxBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdMaxBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdMaxIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdMaxIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdMaxProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdMaxProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdMaxQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdMaxQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MAX_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdMinBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdMinBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdMinIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdMinIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdMinProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdMinProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdMinQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdMinQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_MIN_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevPopulationQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_POPULATION_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdStddevSampleQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_STDDEV_SAMPLE_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdSumBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdSumBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdSumIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdSumIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdSumProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdSumProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdSumQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdSumQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_SUM_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdVariancePopulationQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_POPULATION_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByProposalIdVarianceSampleQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_PROPOSAL_ID_VARIANCE_SAMPLE_QUEUE_ID_DESC',
  VotesAsc = 'VOTES_ASC',
  VotesDesc = 'VOTES_DESC',
}

export enum ProposalType {
  AnchorCreateProposal = 'AnchorCreateProposal',
  AnchorUpdateProposal = 'AnchorUpdateProposal',
  EvmProposal = 'EvmProposal',
  FeeRecipientUpdateProposal = 'FeeRecipientUpdateProposal',
  MaxDepositLimitUpdateProposal = 'MaxDepositLimitUpdateProposal',
  MinWithdrawalLimitUpdateProposal = 'MinWithdrawalLimitUpdateProposal',
  ProposerSetUpdateProposal = 'ProposerSetUpdateProposal',
  RefreshVote = 'RefreshVote',
  RescueTokensProposal = 'RescueTokensProposal',
  ResourceIdUpdateProposal = 'ResourceIdUpdateProposal',
  SetTreasuryHandlerProposal = 'SetTreasuryHandlerProposal',
  SetVerifierProposal = 'SetVerifierProposal',
  TokenAddProposal = 'TokenAddProposal',
  TokenRemoveProposal = 'TokenRemoveProposal',
  Unknown = 'Unknown',
  WrappingFeeUpdateProposal = 'WrappingFeeUpdateProposal',
}

/** A filter to be used against ProposalType fields. All fields are combined with a logical ‘and.’ */
export type ProposalTypeFilter = {
  /** Not equal to the specified value, treating null like an ordinary value. */
  distinctFrom?: InputMaybe<ProposalType>;
  /** Equal to the specified value. */
  equalTo?: InputMaybe<ProposalType>;
  /** Greater than the specified value. */
  greaterThan?: InputMaybe<ProposalType>;
  /** Greater than or equal to the specified value. */
  greaterThanOrEqualTo?: InputMaybe<ProposalType>;
  /** Included in the specified list. */
  in?: InputMaybe<Array<ProposalType>>;
  /** Is null (if `true` is specified) or is not null (if `false` is specified). */
  isNull?: InputMaybe<Scalars['Boolean']>;
  /** Less than the specified value. */
  lessThan?: InputMaybe<ProposalType>;
  /** Less than or equal to the specified value. */
  lessThanOrEqualTo?: InputMaybe<ProposalType>;
  /** Equal to the specified value, treating null like an ordinary value. */
  notDistinctFrom?: InputMaybe<ProposalType>;
  /** Not equal to the specified value. */
  notEqualTo?: InputMaybe<ProposalType>;
  /** Not included in the specified list. */
  notIn?: InputMaybe<Array<ProposalType>>;
};

export type Proposer = Node & {
  __typename?: 'Proposer';
  /** Reads a single `Block` that is related to this `Proposer`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  count: Scalars['Int'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  proposers: Scalars['JSON'];
};

export type ProposerAggregates = {
  __typename?: 'ProposerAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<ProposerAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<ProposerDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<ProposerMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<ProposerMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<ProposerStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<ProposerStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<ProposerSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<ProposerVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<ProposerVarianceSampleAggregates>;
};

export type ProposerAverageAggregates = {
  __typename?: 'ProposerAverageAggregates';
  /** Mean average of count across the matching connection */
  count?: Maybe<Scalars['BigFloat']>;
};

export type ProposerDistinctCountAggregates = {
  __typename?: 'ProposerDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of count across the matching connection */
  count?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposers across the matching connection */
  proposers?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Proposer` object types. All fields are combined with a logical ‘and.’ */
export type ProposerFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ProposerFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `count` field. */
  count?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ProposerFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ProposerFilter>>;
  /** Filter by the object’s `proposers` field. */
  proposers?: InputMaybe<JsonFilter>;
};

export type ProposerMaxAggregates = {
  __typename?: 'ProposerMaxAggregates';
  /** Maximum of count across the matching connection */
  count?: Maybe<Scalars['Int']>;
};

export type ProposerMinAggregates = {
  __typename?: 'ProposerMinAggregates';
  /** Minimum of count across the matching connection */
  count?: Maybe<Scalars['Int']>;
};

export type ProposerStddevPopulationAggregates = {
  __typename?: 'ProposerStddevPopulationAggregates';
  /** Population standard deviation of count across the matching connection */
  count?: Maybe<Scalars['BigFloat']>;
};

export type ProposerStddevSampleAggregates = {
  __typename?: 'ProposerStddevSampleAggregates';
  /** Sample standard deviation of count across the matching connection */
  count?: Maybe<Scalars['BigFloat']>;
};

export type ProposerSumAggregates = {
  __typename?: 'ProposerSumAggregates';
  /** Sum of count across the matching connection */
  count: Scalars['BigInt'];
};

export type ProposerThreshold = Node & {
  __typename?: 'ProposerThreshold';
  /** Reads a single `Block` that is related to this `ProposerThreshold`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  value?: Maybe<Scalars['Int']>;
};

export type ProposerThresholdAggregates = {
  __typename?: 'ProposerThresholdAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<ProposerThresholdAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<ProposerThresholdDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<ProposerThresholdMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<ProposerThresholdMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<ProposerThresholdStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<ProposerThresholdStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<ProposerThresholdSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<ProposerThresholdVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<ProposerThresholdVarianceSampleAggregates>;
};

export type ProposerThresholdAverageAggregates = {
  __typename?: 'ProposerThresholdAverageAggregates';
  /** Mean average of value across the matching connection */
  value?: Maybe<Scalars['BigFloat']>;
};

export type ProposerThresholdDistinctCountAggregates = {
  __typename?: 'ProposerThresholdDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of value across the matching connection */
  value?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `ProposerThreshold` object types. All fields are combined with a logical ‘and.’ */
export type ProposerThresholdFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ProposerThresholdFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ProposerThresholdFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ProposerThresholdFilter>>;
  /** Filter by the object’s `value` field. */
  value?: InputMaybe<IntFilter>;
};

export type ProposerThresholdMaxAggregates = {
  __typename?: 'ProposerThresholdMaxAggregates';
  /** Maximum of value across the matching connection */
  value?: Maybe<Scalars['Int']>;
};

export type ProposerThresholdMinAggregates = {
  __typename?: 'ProposerThresholdMinAggregates';
  /** Minimum of value across the matching connection */
  value?: Maybe<Scalars['Int']>;
};

export type ProposerThresholdStddevPopulationAggregates = {
  __typename?: 'ProposerThresholdStddevPopulationAggregates';
  /** Population standard deviation of value across the matching connection */
  value?: Maybe<Scalars['BigFloat']>;
};

export type ProposerThresholdStddevSampleAggregates = {
  __typename?: 'ProposerThresholdStddevSampleAggregates';
  /** Sample standard deviation of value across the matching connection */
  value?: Maybe<Scalars['BigFloat']>;
};

export type ProposerThresholdSumAggregates = {
  __typename?: 'ProposerThresholdSumAggregates';
  /** Sum of value across the matching connection */
  value: Scalars['BigInt'];
};

export type ProposerThresholdVariancePopulationAggregates = {
  __typename?: 'ProposerThresholdVariancePopulationAggregates';
  /** Population variance of value across the matching connection */
  value?: Maybe<Scalars['BigFloat']>;
};

export type ProposerThresholdVarianceSampleAggregates = {
  __typename?: 'ProposerThresholdVarianceSampleAggregates';
  /** Sample variance of value across the matching connection */
  value?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `ProposerThreshold` values. */
export type ProposerThresholdsConnection = {
  __typename?: 'ProposerThresholdsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposerThresholdAggregates>;
  /** A list of edges which contains the `ProposerThreshold` and cursor to aid in pagination. */
  edges: Array<ProposerThresholdsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposerThresholdAggregates>>;
  /** A list of `ProposerThreshold` objects. */
  nodes: Array<Maybe<ProposerThreshold>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `ProposerThreshold` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `ProposerThreshold` values. */
export type ProposerThresholdsConnectionGroupedAggregatesArgs = {
  groupBy: Array<ProposerThresholdsGroupBy>;
  having?: InputMaybe<ProposerThresholdsHavingInput>;
};

/** A `ProposerThreshold` edge in the connection. */
export type ProposerThresholdsEdge = {
  __typename?: 'ProposerThresholdsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ProposerThreshold` at the end of the edge. */
  node?: Maybe<ProposerThreshold>;
};

/** Grouping methods for `ProposerThreshold` for usage during aggregation. */
export enum ProposerThresholdsGroupBy {
  BlockId = 'BLOCK_ID',
  Value = 'VALUE',
}

export type ProposerThresholdsHavingAverageInput = {
  value?: InputMaybe<HavingIntFilter>;
};

export type ProposerThresholdsHavingDistinctCountInput = {
  value?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `ProposerThreshold` aggregates. */
export type ProposerThresholdsHavingInput = {
  AND?: InputMaybe<Array<ProposerThresholdsHavingInput>>;
  OR?: InputMaybe<Array<ProposerThresholdsHavingInput>>;
  average?: InputMaybe<ProposerThresholdsHavingAverageInput>;
  distinctCount?: InputMaybe<ProposerThresholdsHavingDistinctCountInput>;
  max?: InputMaybe<ProposerThresholdsHavingMaxInput>;
  min?: InputMaybe<ProposerThresholdsHavingMinInput>;
  stddevPopulation?: InputMaybe<ProposerThresholdsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<ProposerThresholdsHavingStddevSampleInput>;
  sum?: InputMaybe<ProposerThresholdsHavingSumInput>;
  variancePopulation?: InputMaybe<ProposerThresholdsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<ProposerThresholdsHavingVarianceSampleInput>;
};

export type ProposerThresholdsHavingMaxInput = {
  value?: InputMaybe<HavingIntFilter>;
};

export type ProposerThresholdsHavingMinInput = {
  value?: InputMaybe<HavingIntFilter>;
};

export type ProposerThresholdsHavingStddevPopulationInput = {
  value?: InputMaybe<HavingIntFilter>;
};

export type ProposerThresholdsHavingStddevSampleInput = {
  value?: InputMaybe<HavingIntFilter>;
};

export type ProposerThresholdsHavingSumInput = {
  value?: InputMaybe<HavingIntFilter>;
};

export type ProposerThresholdsHavingVariancePopulationInput = {
  value?: InputMaybe<HavingIntFilter>;
};

export type ProposerThresholdsHavingVarianceSampleInput = {
  value?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `ProposerThreshold`. */
export enum ProposerThresholdsOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ValueAsc = 'VALUE_ASC',
  ValueDesc = 'VALUE_DESC',
}

export type ProposerVariancePopulationAggregates = {
  __typename?: 'ProposerVariancePopulationAggregates';
  /** Population variance of count across the matching connection */
  count?: Maybe<Scalars['BigFloat']>;
};

export type ProposerVarianceSampleAggregates = {
  __typename?: 'ProposerVarianceSampleAggregates';
  /** Sample variance of count across the matching connection */
  count?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `Proposer` values. */
export type ProposersConnection = {
  __typename?: 'ProposersConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposerAggregates>;
  /** A list of edges which contains the `Proposer` and cursor to aid in pagination. */
  edges: Array<ProposersEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposerAggregates>>;
  /** A list of `Proposer` objects. */
  nodes: Array<Maybe<Proposer>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Proposer` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Proposer` values. */
export type ProposersConnectionGroupedAggregatesArgs = {
  groupBy: Array<ProposersGroupBy>;
  having?: InputMaybe<ProposersHavingInput>;
};

/** A `Proposer` edge in the connection. */
export type ProposersEdge = {
  __typename?: 'ProposersEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Proposer` at the end of the edge. */
  node?: Maybe<Proposer>;
};

/** Grouping methods for `Proposer` for usage during aggregation. */
export enum ProposersGroupBy {
  BlockId = 'BLOCK_ID',
  Count = 'COUNT',
  Proposers = 'PROPOSERS',
}

export type ProposersHavingAverageInput = {
  count?: InputMaybe<HavingIntFilter>;
};

export type ProposersHavingDistinctCountInput = {
  count?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `Proposer` aggregates. */
export type ProposersHavingInput = {
  AND?: InputMaybe<Array<ProposersHavingInput>>;
  OR?: InputMaybe<Array<ProposersHavingInput>>;
  average?: InputMaybe<ProposersHavingAverageInput>;
  distinctCount?: InputMaybe<ProposersHavingDistinctCountInput>;
  max?: InputMaybe<ProposersHavingMaxInput>;
  min?: InputMaybe<ProposersHavingMinInput>;
  stddevPopulation?: InputMaybe<ProposersHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<ProposersHavingStddevSampleInput>;
  sum?: InputMaybe<ProposersHavingSumInput>;
  variancePopulation?: InputMaybe<ProposersHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<ProposersHavingVarianceSampleInput>;
};

export type ProposersHavingMaxInput = {
  count?: InputMaybe<HavingIntFilter>;
};

export type ProposersHavingMinInput = {
  count?: InputMaybe<HavingIntFilter>;
};

export type ProposersHavingStddevPopulationInput = {
  count?: InputMaybe<HavingIntFilter>;
};

export type ProposersHavingStddevSampleInput = {
  count?: InputMaybe<HavingIntFilter>;
};

export type ProposersHavingSumInput = {
  count?: InputMaybe<HavingIntFilter>;
};

export type ProposersHavingVariancePopulationInput = {
  count?: InputMaybe<HavingIntFilter>;
};

export type ProposersHavingVarianceSampleInput = {
  count?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `Proposer`. */
export enum ProposersOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CountAsc = 'COUNT_ASC',
  CountDesc = 'COUNT_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposersAsc = 'PROPOSERS_ASC',
  ProposersDesc = 'PROPOSERS_DESC',
}

export type PublicKey = Node & {
  __typename?: 'PublicKey';
  /** Reads a single `Block` that is related to this `PublicKey`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  /** Reads and enables pagination through a set of `Block`. */
  blocksBySessionPublicKeyIdAndBlockId: PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyConnection;
  compressed?: Maybe<Scalars['String']>;
  history: Scalars['JSON'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads and enables pagination through a set of `Session`. */
  sessions: SessionsConnection;
  uncompressed?: Maybe<Scalars['String']>;
};

export type PublicKeyBlocksBySessionPublicKeyIdAndBlockIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<BlockFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<BlocksOrderBy>>;
};

export type PublicKeySessionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionsOrderBy>>;
};

export type PublicKeyAggregates = {
  __typename?: 'PublicKeyAggregates';
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<PublicKeyDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
};

/** A connection to a list of `Block` values, with data from `Session`. */
export type PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyConnection = {
  __typename?: 'PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<BlockAggregates>;
  /** A list of edges which contains the `Block`, info from the `Session`, and the cursor to aid in pagination. */
  edges: Array<PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<BlockAggregates>>;
  /** A list of `Block` objects. */
  nodes: Array<Maybe<Block>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Block` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Block` values, with data from `Session`. */
export type PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<BlocksGroupBy>;
  having?: InputMaybe<BlocksHavingInput>;
};

/** A `Block` edge in the connection, with data from `Session`. */
export type PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyEdge = {
  __typename?: 'PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Block` at the end of the edge. */
  node?: Maybe<Block>;
  /** Reads and enables pagination through a set of `Session`. */
  sessions: SessionsConnection;
};

/** A `Block` edge in the connection, with data from `Session`. */
export type PublicKeyBlocksBySessionPublicKeyIdAndBlockIdManyToManyEdgeSessionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionsOrderBy>>;
};

export type PublicKeyDistinctCountAggregates = {
  __typename?: 'PublicKeyDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of compressed across the matching connection */
  compressed?: Maybe<Scalars['BigInt']>;
  /** Distinct count of history across the matching connection */
  history?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of uncompressed across the matching connection */
  uncompressed?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `PublicKey` object types. All fields are combined with a logical ‘and.’ */
export type PublicKeyFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<PublicKeyFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `compressed` field. */
  compressed?: InputMaybe<StringFilter>;
  /** Filter by the object’s `history` field. */
  history?: InputMaybe<JsonFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<PublicKeyFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<PublicKeyFilter>>;
  /** Filter by the object’s `uncompressed` field. */
  uncompressed?: InputMaybe<StringFilter>;
};

/** A connection to a list of `PublicKey` values. */
export type PublicKeysConnection = {
  __typename?: 'PublicKeysConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<PublicKeyAggregates>;
  /** A list of edges which contains the `PublicKey` and cursor to aid in pagination. */
  edges: Array<PublicKeysEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<PublicKeyAggregates>>;
  /** A list of `PublicKey` objects. */
  nodes: Array<Maybe<PublicKey>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `PublicKey` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `PublicKey` values. */
export type PublicKeysConnectionGroupedAggregatesArgs = {
  groupBy: Array<PublicKeysGroupBy>;
  having?: InputMaybe<PublicKeysHavingInput>;
};

/** A `PublicKey` edge in the connection. */
export type PublicKeysEdge = {
  __typename?: 'PublicKeysEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `PublicKey` at the end of the edge. */
  node?: Maybe<PublicKey>;
};

/** Grouping methods for `PublicKey` for usage during aggregation. */
export enum PublicKeysGroupBy {
  BlockId = 'BLOCK_ID',
  Compressed = 'COMPRESSED',
  History = 'HISTORY',
}

/** Conditions for `PublicKey` aggregates. */
export type PublicKeysHavingInput = {
  AND?: InputMaybe<Array<PublicKeysHavingInput>>;
  OR?: InputMaybe<Array<PublicKeysHavingInput>>;
};

/** Methods to use when ordering `PublicKey`. */
export enum PublicKeysOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  CompressedAsc = 'COMPRESSED_ASC',
  CompressedDesc = 'COMPRESSED_DESC',
  HistoryAsc = 'HISTORY_ASC',
  HistoryDesc = 'HISTORY_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SessionsAverageBlockIdAsc = 'SESSIONS_AVERAGE_BLOCK_ID_ASC',
  SessionsAverageBlockIdDesc = 'SESSIONS_AVERAGE_BLOCK_ID_DESC',
  SessionsAverageBlockNumberAsc = 'SESSIONS_AVERAGE_BLOCK_NUMBER_ASC',
  SessionsAverageBlockNumberDesc = 'SESSIONS_AVERAGE_BLOCK_NUMBER_DESC',
  SessionsAverageIdAsc = 'SESSIONS_AVERAGE_ID_ASC',
  SessionsAverageIdDesc = 'SESSIONS_AVERAGE_ID_DESC',
  SessionsAverageKeyGenThresholdAsc = 'SESSIONS_AVERAGE_KEY_GEN_THRESHOLD_ASC',
  SessionsAverageKeyGenThresholdDesc = 'SESSIONS_AVERAGE_KEY_GEN_THRESHOLD_DESC',
  SessionsAverageProposersAsc = 'SESSIONS_AVERAGE_PROPOSERS_ASC',
  SessionsAverageProposersCountAsc = 'SESSIONS_AVERAGE_PROPOSERS_COUNT_ASC',
  SessionsAverageProposersCountDesc = 'SESSIONS_AVERAGE_PROPOSERS_COUNT_DESC',
  SessionsAverageProposersDesc = 'SESSIONS_AVERAGE_PROPOSERS_DESC',
  SessionsAverageProposerThresholdAsc = 'SESSIONS_AVERAGE_PROPOSER_THRESHOLD_ASC',
  SessionsAverageProposerThresholdDesc = 'SESSIONS_AVERAGE_PROPOSER_THRESHOLD_DESC',
  SessionsAveragePublicKeyIdAsc = 'SESSIONS_AVERAGE_PUBLIC_KEY_ID_ASC',
  SessionsAveragePublicKeyIdDesc = 'SESSIONS_AVERAGE_PUBLIC_KEY_ID_DESC',
  SessionsAverageSignatureThresholdAsc = 'SESSIONS_AVERAGE_SIGNATURE_THRESHOLD_ASC',
  SessionsAverageSignatureThresholdDesc = 'SESSIONS_AVERAGE_SIGNATURE_THRESHOLD_DESC',
  SessionsCountAsc = 'SESSIONS_COUNT_ASC',
  SessionsCountDesc = 'SESSIONS_COUNT_DESC',
  SessionsDistinctCountBlockIdAsc = 'SESSIONS_DISTINCT_COUNT_BLOCK_ID_ASC',
  SessionsDistinctCountBlockIdDesc = 'SESSIONS_DISTINCT_COUNT_BLOCK_ID_DESC',
  SessionsDistinctCountBlockNumberAsc = 'SESSIONS_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  SessionsDistinctCountBlockNumberDesc = 'SESSIONS_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  SessionsDistinctCountIdAsc = 'SESSIONS_DISTINCT_COUNT_ID_ASC',
  SessionsDistinctCountIdDesc = 'SESSIONS_DISTINCT_COUNT_ID_DESC',
  SessionsDistinctCountKeyGenThresholdAsc = 'SESSIONS_DISTINCT_COUNT_KEY_GEN_THRESHOLD_ASC',
  SessionsDistinctCountKeyGenThresholdDesc = 'SESSIONS_DISTINCT_COUNT_KEY_GEN_THRESHOLD_DESC',
  SessionsDistinctCountProposersAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_ASC',
  SessionsDistinctCountProposersCountAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_COUNT_ASC',
  SessionsDistinctCountProposersCountDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_COUNT_DESC',
  SessionsDistinctCountProposersDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSERS_DESC',
  SessionsDistinctCountProposerThresholdAsc = 'SESSIONS_DISTINCT_COUNT_PROPOSER_THRESHOLD_ASC',
  SessionsDistinctCountProposerThresholdDesc = 'SESSIONS_DISTINCT_COUNT_PROPOSER_THRESHOLD_DESC',
  SessionsDistinctCountPublicKeyIdAsc = 'SESSIONS_DISTINCT_COUNT_PUBLIC_KEY_ID_ASC',
  SessionsDistinctCountPublicKeyIdDesc = 'SESSIONS_DISTINCT_COUNT_PUBLIC_KEY_ID_DESC',
  SessionsDistinctCountSignatureThresholdAsc = 'SESSIONS_DISTINCT_COUNT_SIGNATURE_THRESHOLD_ASC',
  SessionsDistinctCountSignatureThresholdDesc = 'SESSIONS_DISTINCT_COUNT_SIGNATURE_THRESHOLD_DESC',
  SessionsMaxBlockIdAsc = 'SESSIONS_MAX_BLOCK_ID_ASC',
  SessionsMaxBlockIdDesc = 'SESSIONS_MAX_BLOCK_ID_DESC',
  SessionsMaxBlockNumberAsc = 'SESSIONS_MAX_BLOCK_NUMBER_ASC',
  SessionsMaxBlockNumberDesc = 'SESSIONS_MAX_BLOCK_NUMBER_DESC',
  SessionsMaxIdAsc = 'SESSIONS_MAX_ID_ASC',
  SessionsMaxIdDesc = 'SESSIONS_MAX_ID_DESC',
  SessionsMaxKeyGenThresholdAsc = 'SESSIONS_MAX_KEY_GEN_THRESHOLD_ASC',
  SessionsMaxKeyGenThresholdDesc = 'SESSIONS_MAX_KEY_GEN_THRESHOLD_DESC',
  SessionsMaxProposersAsc = 'SESSIONS_MAX_PROPOSERS_ASC',
  SessionsMaxProposersCountAsc = 'SESSIONS_MAX_PROPOSERS_COUNT_ASC',
  SessionsMaxProposersCountDesc = 'SESSIONS_MAX_PROPOSERS_COUNT_DESC',
  SessionsMaxProposersDesc = 'SESSIONS_MAX_PROPOSERS_DESC',
  SessionsMaxProposerThresholdAsc = 'SESSIONS_MAX_PROPOSER_THRESHOLD_ASC',
  SessionsMaxProposerThresholdDesc = 'SESSIONS_MAX_PROPOSER_THRESHOLD_DESC',
  SessionsMaxPublicKeyIdAsc = 'SESSIONS_MAX_PUBLIC_KEY_ID_ASC',
  SessionsMaxPublicKeyIdDesc = 'SESSIONS_MAX_PUBLIC_KEY_ID_DESC',
  SessionsMaxSignatureThresholdAsc = 'SESSIONS_MAX_SIGNATURE_THRESHOLD_ASC',
  SessionsMaxSignatureThresholdDesc = 'SESSIONS_MAX_SIGNATURE_THRESHOLD_DESC',
  SessionsMinBlockIdAsc = 'SESSIONS_MIN_BLOCK_ID_ASC',
  SessionsMinBlockIdDesc = 'SESSIONS_MIN_BLOCK_ID_DESC',
  SessionsMinBlockNumberAsc = 'SESSIONS_MIN_BLOCK_NUMBER_ASC',
  SessionsMinBlockNumberDesc = 'SESSIONS_MIN_BLOCK_NUMBER_DESC',
  SessionsMinIdAsc = 'SESSIONS_MIN_ID_ASC',
  SessionsMinIdDesc = 'SESSIONS_MIN_ID_DESC',
  SessionsMinKeyGenThresholdAsc = 'SESSIONS_MIN_KEY_GEN_THRESHOLD_ASC',
  SessionsMinKeyGenThresholdDesc = 'SESSIONS_MIN_KEY_GEN_THRESHOLD_DESC',
  SessionsMinProposersAsc = 'SESSIONS_MIN_PROPOSERS_ASC',
  SessionsMinProposersCountAsc = 'SESSIONS_MIN_PROPOSERS_COUNT_ASC',
  SessionsMinProposersCountDesc = 'SESSIONS_MIN_PROPOSERS_COUNT_DESC',
  SessionsMinProposersDesc = 'SESSIONS_MIN_PROPOSERS_DESC',
  SessionsMinProposerThresholdAsc = 'SESSIONS_MIN_PROPOSER_THRESHOLD_ASC',
  SessionsMinProposerThresholdDesc = 'SESSIONS_MIN_PROPOSER_THRESHOLD_DESC',
  SessionsMinPublicKeyIdAsc = 'SESSIONS_MIN_PUBLIC_KEY_ID_ASC',
  SessionsMinPublicKeyIdDesc = 'SESSIONS_MIN_PUBLIC_KEY_ID_DESC',
  SessionsMinSignatureThresholdAsc = 'SESSIONS_MIN_SIGNATURE_THRESHOLD_ASC',
  SessionsMinSignatureThresholdDesc = 'SESSIONS_MIN_SIGNATURE_THRESHOLD_DESC',
  SessionsStddevPopulationBlockIdAsc = 'SESSIONS_STDDEV_POPULATION_BLOCK_ID_ASC',
  SessionsStddevPopulationBlockIdDesc = 'SESSIONS_STDDEV_POPULATION_BLOCK_ID_DESC',
  SessionsStddevPopulationBlockNumberAsc = 'SESSIONS_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  SessionsStddevPopulationBlockNumberDesc = 'SESSIONS_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  SessionsStddevPopulationIdAsc = 'SESSIONS_STDDEV_POPULATION_ID_ASC',
  SessionsStddevPopulationIdDesc = 'SESSIONS_STDDEV_POPULATION_ID_DESC',
  SessionsStddevPopulationKeyGenThresholdAsc = 'SESSIONS_STDDEV_POPULATION_KEY_GEN_THRESHOLD_ASC',
  SessionsStddevPopulationKeyGenThresholdDesc = 'SESSIONS_STDDEV_POPULATION_KEY_GEN_THRESHOLD_DESC',
  SessionsStddevPopulationProposersAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_ASC',
  SessionsStddevPopulationProposersCountAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_COUNT_ASC',
  SessionsStddevPopulationProposersCountDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_COUNT_DESC',
  SessionsStddevPopulationProposersDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSERS_DESC',
  SessionsStddevPopulationProposerThresholdAsc = 'SESSIONS_STDDEV_POPULATION_PROPOSER_THRESHOLD_ASC',
  SessionsStddevPopulationProposerThresholdDesc = 'SESSIONS_STDDEV_POPULATION_PROPOSER_THRESHOLD_DESC',
  SessionsStddevPopulationPublicKeyIdAsc = 'SESSIONS_STDDEV_POPULATION_PUBLIC_KEY_ID_ASC',
  SessionsStddevPopulationPublicKeyIdDesc = 'SESSIONS_STDDEV_POPULATION_PUBLIC_KEY_ID_DESC',
  SessionsStddevPopulationSignatureThresholdAsc = 'SESSIONS_STDDEV_POPULATION_SIGNATURE_THRESHOLD_ASC',
  SessionsStddevPopulationSignatureThresholdDesc = 'SESSIONS_STDDEV_POPULATION_SIGNATURE_THRESHOLD_DESC',
  SessionsStddevSampleBlockIdAsc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_ID_ASC',
  SessionsStddevSampleBlockIdDesc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_ID_DESC',
  SessionsStddevSampleBlockNumberAsc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  SessionsStddevSampleBlockNumberDesc = 'SESSIONS_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  SessionsStddevSampleIdAsc = 'SESSIONS_STDDEV_SAMPLE_ID_ASC',
  SessionsStddevSampleIdDesc = 'SESSIONS_STDDEV_SAMPLE_ID_DESC',
  SessionsStddevSampleKeyGenThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_KEY_GEN_THRESHOLD_ASC',
  SessionsStddevSampleKeyGenThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_KEY_GEN_THRESHOLD_DESC',
  SessionsStddevSampleProposersAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_ASC',
  SessionsStddevSampleProposersCountAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_COUNT_ASC',
  SessionsStddevSampleProposersCountDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_COUNT_DESC',
  SessionsStddevSampleProposersDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSERS_DESC',
  SessionsStddevSampleProposerThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_PROPOSER_THRESHOLD_ASC',
  SessionsStddevSampleProposerThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_PROPOSER_THRESHOLD_DESC',
  SessionsStddevSamplePublicKeyIdAsc = 'SESSIONS_STDDEV_SAMPLE_PUBLIC_KEY_ID_ASC',
  SessionsStddevSamplePublicKeyIdDesc = 'SESSIONS_STDDEV_SAMPLE_PUBLIC_KEY_ID_DESC',
  SessionsStddevSampleSignatureThresholdAsc = 'SESSIONS_STDDEV_SAMPLE_SIGNATURE_THRESHOLD_ASC',
  SessionsStddevSampleSignatureThresholdDesc = 'SESSIONS_STDDEV_SAMPLE_SIGNATURE_THRESHOLD_DESC',
  SessionsSumBlockIdAsc = 'SESSIONS_SUM_BLOCK_ID_ASC',
  SessionsSumBlockIdDesc = 'SESSIONS_SUM_BLOCK_ID_DESC',
  SessionsSumBlockNumberAsc = 'SESSIONS_SUM_BLOCK_NUMBER_ASC',
  SessionsSumBlockNumberDesc = 'SESSIONS_SUM_BLOCK_NUMBER_DESC',
  SessionsSumIdAsc = 'SESSIONS_SUM_ID_ASC',
  SessionsSumIdDesc = 'SESSIONS_SUM_ID_DESC',
  SessionsSumKeyGenThresholdAsc = 'SESSIONS_SUM_KEY_GEN_THRESHOLD_ASC',
  SessionsSumKeyGenThresholdDesc = 'SESSIONS_SUM_KEY_GEN_THRESHOLD_DESC',
  SessionsSumProposersAsc = 'SESSIONS_SUM_PROPOSERS_ASC',
  SessionsSumProposersCountAsc = 'SESSIONS_SUM_PROPOSERS_COUNT_ASC',
  SessionsSumProposersCountDesc = 'SESSIONS_SUM_PROPOSERS_COUNT_DESC',
  SessionsSumProposersDesc = 'SESSIONS_SUM_PROPOSERS_DESC',
  SessionsSumProposerThresholdAsc = 'SESSIONS_SUM_PROPOSER_THRESHOLD_ASC',
  SessionsSumProposerThresholdDesc = 'SESSIONS_SUM_PROPOSER_THRESHOLD_DESC',
  SessionsSumPublicKeyIdAsc = 'SESSIONS_SUM_PUBLIC_KEY_ID_ASC',
  SessionsSumPublicKeyIdDesc = 'SESSIONS_SUM_PUBLIC_KEY_ID_DESC',
  SessionsSumSignatureThresholdAsc = 'SESSIONS_SUM_SIGNATURE_THRESHOLD_ASC',
  SessionsSumSignatureThresholdDesc = 'SESSIONS_SUM_SIGNATURE_THRESHOLD_DESC',
  SessionsVariancePopulationBlockIdAsc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_ID_ASC',
  SessionsVariancePopulationBlockIdDesc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_ID_DESC',
  SessionsVariancePopulationBlockNumberAsc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  SessionsVariancePopulationBlockNumberDesc = 'SESSIONS_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  SessionsVariancePopulationIdAsc = 'SESSIONS_VARIANCE_POPULATION_ID_ASC',
  SessionsVariancePopulationIdDesc = 'SESSIONS_VARIANCE_POPULATION_ID_DESC',
  SessionsVariancePopulationKeyGenThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_KEY_GEN_THRESHOLD_ASC',
  SessionsVariancePopulationKeyGenThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_KEY_GEN_THRESHOLD_DESC',
  SessionsVariancePopulationProposersAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_ASC',
  SessionsVariancePopulationProposersCountAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_COUNT_ASC',
  SessionsVariancePopulationProposersCountDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_COUNT_DESC',
  SessionsVariancePopulationProposersDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSERS_DESC',
  SessionsVariancePopulationProposerThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_PROPOSER_THRESHOLD_ASC',
  SessionsVariancePopulationProposerThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_PROPOSER_THRESHOLD_DESC',
  SessionsVariancePopulationPublicKeyIdAsc = 'SESSIONS_VARIANCE_POPULATION_PUBLIC_KEY_ID_ASC',
  SessionsVariancePopulationPublicKeyIdDesc = 'SESSIONS_VARIANCE_POPULATION_PUBLIC_KEY_ID_DESC',
  SessionsVariancePopulationSignatureThresholdAsc = 'SESSIONS_VARIANCE_POPULATION_SIGNATURE_THRESHOLD_ASC',
  SessionsVariancePopulationSignatureThresholdDesc = 'SESSIONS_VARIANCE_POPULATION_SIGNATURE_THRESHOLD_DESC',
  SessionsVarianceSampleBlockIdAsc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_ID_ASC',
  SessionsVarianceSampleBlockIdDesc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_ID_DESC',
  SessionsVarianceSampleBlockNumberAsc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  SessionsVarianceSampleBlockNumberDesc = 'SESSIONS_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  SessionsVarianceSampleIdAsc = 'SESSIONS_VARIANCE_SAMPLE_ID_ASC',
  SessionsVarianceSampleIdDesc = 'SESSIONS_VARIANCE_SAMPLE_ID_DESC',
  SessionsVarianceSampleKeyGenThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_KEY_GEN_THRESHOLD_ASC',
  SessionsVarianceSampleKeyGenThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_KEY_GEN_THRESHOLD_DESC',
  SessionsVarianceSampleProposersAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_ASC',
  SessionsVarianceSampleProposersCountAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_COUNT_ASC',
  SessionsVarianceSampleProposersCountDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_COUNT_DESC',
  SessionsVarianceSampleProposersDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSERS_DESC',
  SessionsVarianceSampleProposerThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSER_THRESHOLD_ASC',
  SessionsVarianceSampleProposerThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_PROPOSER_THRESHOLD_DESC',
  SessionsVarianceSamplePublicKeyIdAsc = 'SESSIONS_VARIANCE_SAMPLE_PUBLIC_KEY_ID_ASC',
  SessionsVarianceSamplePublicKeyIdDesc = 'SESSIONS_VARIANCE_SAMPLE_PUBLIC_KEY_ID_DESC',
  SessionsVarianceSampleSignatureThresholdAsc = 'SESSIONS_VARIANCE_SAMPLE_SIGNATURE_THRESHOLD_ASC',
  SessionsVarianceSampleSignatureThresholdDesc = 'SESSIONS_VARIANCE_SAMPLE_SIGNATURE_THRESHOLD_DESC',
  UncompressedAsc = 'UNCOMPRESSED_ASC',
  UncompressedDesc = 'UNCOMPRESSED_DESC',
}

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
  proposalCounter?: Maybe<ProposalCounter>;
  /** Reads a single `ProposalCounter` using its globally unique `ID`. */
  proposalCounterByNodeId?: Maybe<ProposalCounter>;
  /** Reads and enables pagination through a set of `ProposalCounter`. */
  proposalCounters?: Maybe<ProposalCountersConnection>;
  proposalItem?: Maybe<ProposalItem>;
  /** Reads a single `ProposalItem` using its globally unique `ID`. */
  proposalItemByNodeId?: Maybe<ProposalItem>;
  /** Reads and enables pagination through a set of `ProposalItem`. */
  proposalItems?: Maybe<ProposalItemsConnection>;
  proposer?: Maybe<Proposer>;
  /** Reads a single `Proposer` using its globally unique `ID`. */
  proposerByNodeId?: Maybe<Proposer>;
  proposerThreshold?: Maybe<ProposerThreshold>;
  /** Reads a single `ProposerThreshold` using its globally unique `ID`. */
  proposerThresholdByNodeId?: Maybe<ProposerThreshold>;
  /** Reads and enables pagination through a set of `ProposerThreshold`. */
  proposerThresholds?: Maybe<ProposerThresholdsConnection>;
  /** Reads and enables pagination through a set of `Proposer`. */
  proposers?: Maybe<ProposersConnection>;
  publicKey?: Maybe<PublicKey>;
  /** Reads a single `PublicKey` using its globally unique `ID`. */
  publicKeyByNodeId?: Maybe<PublicKey>;
  /** Reads and enables pagination through a set of `PublicKey`. */
  publicKeys?: Maybe<PublicKeysConnection>;
  /**
   * Exposes the root query type nested one level down. This is helpful for Relay 1
   * which can only query top level fields if they are in a particular form.
   */
  query: Query;
  session?: Maybe<Session>;
  /** Reads a single `Session` using its globally unique `ID`. */
  sessionByNodeId?: Maybe<Session>;
  sessionValidator?: Maybe<SessionValidator>;
  /** Reads a single `SessionValidator` using its globally unique `ID`. */
  sessionValidatorByNodeId?: Maybe<SessionValidator>;
  /** Reads and enables pagination through a set of `SessionValidator`. */
  sessionValidators?: Maybe<SessionValidatorsConnection>;
  /** Reads and enables pagination through a set of `Session`. */
  sessions?: Maybe<SessionsConnection>;
  signatureThreshold?: Maybe<SignatureThreshold>;
  /** Reads a single `SignatureThreshold` using its globally unique `ID`. */
  signatureThresholdByNodeId?: Maybe<SignatureThreshold>;
  /** Reads and enables pagination through a set of `SignatureThreshold`. */
  signatureThresholds?: Maybe<SignatureThresholdsConnection>;
  unsignedProposalsQueue?: Maybe<UnsignedProposalsQueue>;
  /** Reads a single `UnsignedProposalsQueue` using its globally unique `ID`. */
  unsignedProposalsQueueByNodeId?: Maybe<UnsignedProposalsQueue>;
  unsignedProposalsQueueItem?: Maybe<UnsignedProposalsQueueItem>;
  /** Reads a single `UnsignedProposalsQueueItem` using its globally unique `ID`. */
  unsignedProposalsQueueItemByNodeId?: Maybe<UnsignedProposalsQueueItem>;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueueItem`. */
  unsignedProposalsQueueItems?: Maybe<UnsignedProposalsQueueItemsConnection>;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueue`. */
  unsignedProposalsQueues?: Maybe<UnsignedProposalsQueuesConnection>;
  validator?: Maybe<Validator>;
  /** Reads a single `Validator` using its globally unique `ID`. */
  validatorByNodeId?: Maybe<Validator>;
  /** Reads and enables pagination through a set of `Validator`. */
  validators?: Maybe<ValidatorsConnection>;
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
export type QueryProposalCounterArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalCounterByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalCountersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposalCounterFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposalCountersOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalItemArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalItemByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposalItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposalItemFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposalItemsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryProposerArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposerByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposerThresholdArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposerThresholdByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryProposerThresholdsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposerThresholdFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposerThresholdsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryProposersArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposerFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposersOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryPublicKeyArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryPublicKeyByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryPublicKeysArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<PublicKeyFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<PublicKeysOrderBy>>;
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
export type QuerySessionValidatorArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySessionValidatorByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QuerySessionValidatorsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionValidatorFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionValidatorsOrderBy>>;
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

/** The root query type which gives access points into the data universe. */
export type QueryUnsignedProposalsQueueArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryUnsignedProposalsQueueByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryUnsignedProposalsQueueItemArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryUnsignedProposalsQueueItemByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryUnsignedProposalsQueueItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<UnsignedProposalsQueueItemFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<UnsignedProposalsQueueItemsOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryUnsignedProposalsQueuesArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<UnsignedProposalsQueueFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<UnsignedProposalsQueuesOrderBy>>;
};

/** The root query type which gives access points into the data universe. */
export type QueryValidatorArgs = {
  id: Scalars['String'];
};

/** The root query type which gives access points into the data universe. */
export type QueryValidatorByNodeIdArgs = {
  nodeId: Scalars['ID'];
};

/** The root query type which gives access points into the data universe. */
export type QueryValidatorsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ValidatorFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ValidatorsOrderBy>>;
};

export type Session = Node & {
  __typename?: 'Session';
  /** Reads a single `Block` that is related to this `Session`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  blockNumber: Scalars['Int'];
  id: Scalars['String'];
  keyGenThreshold?: Maybe<Scalars['JSON']>;
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  proposerThreshold?: Maybe<Scalars['JSON']>;
  proposers: Scalars['JSON'];
  proposersCount?: Maybe<Scalars['Int']>;
  /** Reads a single `PublicKey` that is related to this `Session`. */
  publicKey?: Maybe<PublicKey>;
  publicKeyId?: Maybe<Scalars['String']>;
  /** Reads and enables pagination through a set of `SessionValidator`. */
  sessionValidators: SessionValidatorsConnection;
  signatureThreshold?: Maybe<Scalars['JSON']>;
  /** Reads and enables pagination through a set of `Validator`. */
  validatorsBySessionValidatorSessionIdAndValidatorId: SessionValidatorsBySessionValidatorSessionIdAndValidatorIdManyToManyConnection;
};

export type SessionSessionValidatorsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionValidatorFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionValidatorsOrderBy>>;
};

export type SessionValidatorsBySessionValidatorSessionIdAndValidatorIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ValidatorFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ValidatorsOrderBy>>;
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
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of keyGenThreshold across the matching connection */
  keyGenThreshold?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposerThreshold across the matching connection */
  proposerThreshold?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposers across the matching connection */
  proposers?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposersCount across the matching connection */
  proposersCount?: Maybe<Scalars['BigInt']>;
  /** Distinct count of publicKeyId across the matching connection */
  publicKeyId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of signatureThreshold across the matching connection */
  signatureThreshold?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Session` object types. All fields are combined with a logical ‘and.’ */
export type SessionFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SessionFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `keyGenThreshold` field. */
  keyGenThreshold?: InputMaybe<JsonFilter>;
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
  /** Filter by the object’s `publicKeyId` field. */
  publicKeyId?: InputMaybe<StringFilter>;
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

export type SessionValidator = Node & {
  __typename?: 'SessionValidator';
  bestOrder: Scalars['Int'];
  id: Scalars['String'];
  isBest: Scalars['Boolean'];
  isNext: Scalars['Boolean'];
  isNextBest: Scalars['Boolean'];
  nextBestOrder: Scalars['Int'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  reputation: Scalars['String'];
  /** Reads a single `Session` that is related to this `SessionValidator`. */
  session?: Maybe<Session>;
  sessionId: Scalars['String'];
  /** Reads a single `Validator` that is related to this `SessionValidator`. */
  validator?: Maybe<Validator>;
  validatorId: Scalars['String'];
};

export type SessionValidatorAggregates = {
  __typename?: 'SessionValidatorAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<SessionValidatorAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<SessionValidatorDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<SessionValidatorMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<SessionValidatorMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<SessionValidatorStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<SessionValidatorStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<SessionValidatorSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<SessionValidatorVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<SessionValidatorVarianceSampleAggregates>;
};

export type SessionValidatorAverageAggregates = {
  __typename?: 'SessionValidatorAverageAggregates';
  /** Mean average of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['BigFloat']>;
  /** Mean average of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['BigFloat']>;
};

export type SessionValidatorDistinctCountAggregates = {
  __typename?: 'SessionValidatorDistinctCountAggregates';
  /** Distinct count of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of isBest across the matching connection */
  isBest?: Maybe<Scalars['BigInt']>;
  /** Distinct count of isNext across the matching connection */
  isNext?: Maybe<Scalars['BigInt']>;
  /** Distinct count of isNextBest across the matching connection */
  isNextBest?: Maybe<Scalars['BigInt']>;
  /** Distinct count of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['BigInt']>;
  /** Distinct count of reputation across the matching connection */
  reputation?: Maybe<Scalars['BigInt']>;
  /** Distinct count of sessionId across the matching connection */
  sessionId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of validatorId across the matching connection */
  validatorId?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `SessionValidator` object types. All fields are combined with a logical ‘and.’ */
export type SessionValidatorFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<SessionValidatorFilter>>;
  /** Filter by the object’s `bestOrder` field. */
  bestOrder?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Filter by the object’s `isBest` field. */
  isBest?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isNext` field. */
  isNext?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `isNextBest` field. */
  isNextBest?: InputMaybe<BooleanFilter>;
  /** Filter by the object’s `nextBestOrder` field. */
  nextBestOrder?: InputMaybe<IntFilter>;
  /** Negates the expression. */
  not?: InputMaybe<SessionValidatorFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<SessionValidatorFilter>>;
  /** Filter by the object’s `reputation` field. */
  reputation?: InputMaybe<StringFilter>;
  /** Filter by the object’s `sessionId` field. */
  sessionId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `validatorId` field. */
  validatorId?: InputMaybe<StringFilter>;
};

export type SessionValidatorMaxAggregates = {
  __typename?: 'SessionValidatorMaxAggregates';
  /** Maximum of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['Int']>;
  /** Maximum of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['Int']>;
};

export type SessionValidatorMinAggregates = {
  __typename?: 'SessionValidatorMinAggregates';
  /** Minimum of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['Int']>;
  /** Minimum of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['Int']>;
};

export type SessionValidatorStddevPopulationAggregates = {
  __typename?: 'SessionValidatorStddevPopulationAggregates';
  /** Population standard deviation of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['BigFloat']>;
  /** Population standard deviation of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['BigFloat']>;
};

export type SessionValidatorStddevSampleAggregates = {
  __typename?: 'SessionValidatorStddevSampleAggregates';
  /** Sample standard deviation of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['BigFloat']>;
  /** Sample standard deviation of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['BigFloat']>;
};

export type SessionValidatorSumAggregates = {
  __typename?: 'SessionValidatorSumAggregates';
  /** Sum of bestOrder across the matching connection */
  bestOrder: Scalars['BigInt'];
  /** Sum of nextBestOrder across the matching connection */
  nextBestOrder: Scalars['BigInt'];
};

export type SessionValidatorVariancePopulationAggregates = {
  __typename?: 'SessionValidatorVariancePopulationAggregates';
  /** Population variance of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['BigFloat']>;
  /** Population variance of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['BigFloat']>;
};

export type SessionValidatorVarianceSampleAggregates = {
  __typename?: 'SessionValidatorVarianceSampleAggregates';
  /** Sample variance of bestOrder across the matching connection */
  bestOrder?: Maybe<Scalars['BigFloat']>;
  /** Sample variance of nextBestOrder across the matching connection */
  nextBestOrder?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `Validator` values, with data from `SessionValidator`. */
export type SessionValidatorsBySessionValidatorSessionIdAndValidatorIdManyToManyConnection = {
  __typename?: 'SessionValidatorsBySessionValidatorSessionIdAndValidatorIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ValidatorAggregates>;
  /** A list of edges which contains the `Validator`, info from the `SessionValidator`, and the cursor to aid in pagination. */
  edges: Array<SessionValidatorsBySessionValidatorSessionIdAndValidatorIdManyToManyEdge>;
  /** A list of `Validator` objects. */
  nodes: Array<Maybe<Validator>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Validator` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Validator` edge in the connection, with data from `SessionValidator`. */
export type SessionValidatorsBySessionValidatorSessionIdAndValidatorIdManyToManyEdge = {
  __typename?: 'SessionValidatorsBySessionValidatorSessionIdAndValidatorIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Validator` at the end of the edge. */
  node?: Maybe<Validator>;
  /** Reads and enables pagination through a set of `SessionValidator`. */
  sessionValidators: SessionValidatorsConnection;
};

/** A `Validator` edge in the connection, with data from `SessionValidator`. */
export type SessionValidatorsBySessionValidatorSessionIdAndValidatorIdManyToManyEdgeSessionValidatorsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionValidatorFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionValidatorsOrderBy>>;
};

/** A connection to a list of `SessionValidator` values. */
export type SessionValidatorsConnection = {
  __typename?: 'SessionValidatorsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<SessionValidatorAggregates>;
  /** A list of edges which contains the `SessionValidator` and cursor to aid in pagination. */
  edges: Array<SessionValidatorsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<SessionValidatorAggregates>>;
  /** A list of `SessionValidator` objects. */
  nodes: Array<Maybe<SessionValidator>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `SessionValidator` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `SessionValidator` values. */
export type SessionValidatorsConnectionGroupedAggregatesArgs = {
  groupBy: Array<SessionValidatorsGroupBy>;
  having?: InputMaybe<SessionValidatorsHavingInput>;
};

/** A `SessionValidator` edge in the connection. */
export type SessionValidatorsEdge = {
  __typename?: 'SessionValidatorsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `SessionValidator` at the end of the edge. */
  node?: Maybe<SessionValidator>;
};

/** Grouping methods for `SessionValidator` for usage during aggregation. */
export enum SessionValidatorsGroupBy {
  BestOrder = 'BEST_ORDER',
  IsBest = 'IS_BEST',
  IsNext = 'IS_NEXT',
  IsNextBest = 'IS_NEXT_BEST',
  NextBestOrder = 'NEXT_BEST_ORDER',
  Reputation = 'REPUTATION',
  SessionId = 'SESSION_ID',
  ValidatorId = 'VALIDATOR_ID',
}

export type SessionValidatorsHavingAverageInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

export type SessionValidatorsHavingDistinctCountInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `SessionValidator` aggregates. */
export type SessionValidatorsHavingInput = {
  AND?: InputMaybe<Array<SessionValidatorsHavingInput>>;
  OR?: InputMaybe<Array<SessionValidatorsHavingInput>>;
  average?: InputMaybe<SessionValidatorsHavingAverageInput>;
  distinctCount?: InputMaybe<SessionValidatorsHavingDistinctCountInput>;
  max?: InputMaybe<SessionValidatorsHavingMaxInput>;
  min?: InputMaybe<SessionValidatorsHavingMinInput>;
  stddevPopulation?: InputMaybe<SessionValidatorsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<SessionValidatorsHavingStddevSampleInput>;
  sum?: InputMaybe<SessionValidatorsHavingSumInput>;
  variancePopulation?: InputMaybe<SessionValidatorsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<SessionValidatorsHavingVarianceSampleInput>;
};

export type SessionValidatorsHavingMaxInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

export type SessionValidatorsHavingMinInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

export type SessionValidatorsHavingStddevPopulationInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

export type SessionValidatorsHavingStddevSampleInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

export type SessionValidatorsHavingSumInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

export type SessionValidatorsHavingVariancePopulationInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

export type SessionValidatorsHavingVarianceSampleInput = {
  bestOrder?: InputMaybe<HavingIntFilter>;
  nextBestOrder?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `SessionValidator`. */
export enum SessionValidatorsOrderBy {
  BestOrderAsc = 'BEST_ORDER_ASC',
  BestOrderDesc = 'BEST_ORDER_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  IsBestAsc = 'IS_BEST_ASC',
  IsBestDesc = 'IS_BEST_DESC',
  IsNextAsc = 'IS_NEXT_ASC',
  IsNextBestAsc = 'IS_NEXT_BEST_ASC',
  IsNextBestDesc = 'IS_NEXT_BEST_DESC',
  IsNextDesc = 'IS_NEXT_DESC',
  Natural = 'NATURAL',
  NextBestOrderAsc = 'NEXT_BEST_ORDER_ASC',
  NextBestOrderDesc = 'NEXT_BEST_ORDER_DESC',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ReputationAsc = 'REPUTATION_ASC',
  ReputationDesc = 'REPUTATION_DESC',
  SessionIdAsc = 'SESSION_ID_ASC',
  SessionIdDesc = 'SESSION_ID_DESC',
  ValidatorIdAsc = 'VALIDATOR_ID_ASC',
  ValidatorIdDesc = 'VALIDATOR_ID_DESC',
}

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
  BlockId = 'BLOCK_ID',
  BlockNumber = 'BLOCK_NUMBER',
  KeyGenThreshold = 'KEY_GEN_THRESHOLD',
  Proposers = 'PROPOSERS',
  ProposersCount = 'PROPOSERS_COUNT',
  ProposerThreshold = 'PROPOSER_THRESHOLD',
  PublicKeyId = 'PUBLIC_KEY_ID',
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
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  KeyGenThresholdAsc = 'KEY_GEN_THRESHOLD_ASC',
  KeyGenThresholdDesc = 'KEY_GEN_THRESHOLD_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposersAsc = 'PROPOSERS_ASC',
  ProposersCountAsc = 'PROPOSERS_COUNT_ASC',
  ProposersCountDesc = 'PROPOSERS_COUNT_DESC',
  ProposersDesc = 'PROPOSERS_DESC',
  ProposerThresholdAsc = 'PROPOSER_THRESHOLD_ASC',
  ProposerThresholdDesc = 'PROPOSER_THRESHOLD_DESC',
  PublicKeyIdAsc = 'PUBLIC_KEY_ID_ASC',
  PublicKeyIdDesc = 'PUBLIC_KEY_ID_DESC',
  SessionValidatorsAverageBestOrderAsc = 'SESSION_VALIDATORS_AVERAGE_BEST_ORDER_ASC',
  SessionValidatorsAverageBestOrderDesc = 'SESSION_VALIDATORS_AVERAGE_BEST_ORDER_DESC',
  SessionValidatorsAverageIdAsc = 'SESSION_VALIDATORS_AVERAGE_ID_ASC',
  SessionValidatorsAverageIdDesc = 'SESSION_VALIDATORS_AVERAGE_ID_DESC',
  SessionValidatorsAverageIsBestAsc = 'SESSION_VALIDATORS_AVERAGE_IS_BEST_ASC',
  SessionValidatorsAverageIsBestDesc = 'SESSION_VALIDATORS_AVERAGE_IS_BEST_DESC',
  SessionValidatorsAverageIsNextAsc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_ASC',
  SessionValidatorsAverageIsNextBestAsc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_BEST_ASC',
  SessionValidatorsAverageIsNextBestDesc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_BEST_DESC',
  SessionValidatorsAverageIsNextDesc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_DESC',
  SessionValidatorsAverageNextBestOrderAsc = 'SESSION_VALIDATORS_AVERAGE_NEXT_BEST_ORDER_ASC',
  SessionValidatorsAverageNextBestOrderDesc = 'SESSION_VALIDATORS_AVERAGE_NEXT_BEST_ORDER_DESC',
  SessionValidatorsAverageReputationAsc = 'SESSION_VALIDATORS_AVERAGE_REPUTATION_ASC',
  SessionValidatorsAverageReputationDesc = 'SESSION_VALIDATORS_AVERAGE_REPUTATION_DESC',
  SessionValidatorsAverageSessionIdAsc = 'SESSION_VALIDATORS_AVERAGE_SESSION_ID_ASC',
  SessionValidatorsAverageSessionIdDesc = 'SESSION_VALIDATORS_AVERAGE_SESSION_ID_DESC',
  SessionValidatorsAverageValidatorIdAsc = 'SESSION_VALIDATORS_AVERAGE_VALIDATOR_ID_ASC',
  SessionValidatorsAverageValidatorIdDesc = 'SESSION_VALIDATORS_AVERAGE_VALIDATOR_ID_DESC',
  SessionValidatorsCountAsc = 'SESSION_VALIDATORS_COUNT_ASC',
  SessionValidatorsCountDesc = 'SESSION_VALIDATORS_COUNT_DESC',
  SessionValidatorsDistinctCountBestOrderAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_BEST_ORDER_ASC',
  SessionValidatorsDistinctCountBestOrderDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_BEST_ORDER_DESC',
  SessionValidatorsDistinctCountIdAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_ID_ASC',
  SessionValidatorsDistinctCountIdDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_ID_DESC',
  SessionValidatorsDistinctCountIsBestAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_BEST_ASC',
  SessionValidatorsDistinctCountIsBestDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_BEST_DESC',
  SessionValidatorsDistinctCountIsNextAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_ASC',
  SessionValidatorsDistinctCountIsNextBestAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_BEST_ASC',
  SessionValidatorsDistinctCountIsNextBestDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_BEST_DESC',
  SessionValidatorsDistinctCountIsNextDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_DESC',
  SessionValidatorsDistinctCountNextBestOrderAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_NEXT_BEST_ORDER_ASC',
  SessionValidatorsDistinctCountNextBestOrderDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_NEXT_BEST_ORDER_DESC',
  SessionValidatorsDistinctCountReputationAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_REPUTATION_ASC',
  SessionValidatorsDistinctCountReputationDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_REPUTATION_DESC',
  SessionValidatorsDistinctCountSessionIdAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_SESSION_ID_ASC',
  SessionValidatorsDistinctCountSessionIdDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_SESSION_ID_DESC',
  SessionValidatorsDistinctCountValidatorIdAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_VALIDATOR_ID_ASC',
  SessionValidatorsDistinctCountValidatorIdDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_VALIDATOR_ID_DESC',
  SessionValidatorsMaxBestOrderAsc = 'SESSION_VALIDATORS_MAX_BEST_ORDER_ASC',
  SessionValidatorsMaxBestOrderDesc = 'SESSION_VALIDATORS_MAX_BEST_ORDER_DESC',
  SessionValidatorsMaxIdAsc = 'SESSION_VALIDATORS_MAX_ID_ASC',
  SessionValidatorsMaxIdDesc = 'SESSION_VALIDATORS_MAX_ID_DESC',
  SessionValidatorsMaxIsBestAsc = 'SESSION_VALIDATORS_MAX_IS_BEST_ASC',
  SessionValidatorsMaxIsBestDesc = 'SESSION_VALIDATORS_MAX_IS_BEST_DESC',
  SessionValidatorsMaxIsNextAsc = 'SESSION_VALIDATORS_MAX_IS_NEXT_ASC',
  SessionValidatorsMaxIsNextBestAsc = 'SESSION_VALIDATORS_MAX_IS_NEXT_BEST_ASC',
  SessionValidatorsMaxIsNextBestDesc = 'SESSION_VALIDATORS_MAX_IS_NEXT_BEST_DESC',
  SessionValidatorsMaxIsNextDesc = 'SESSION_VALIDATORS_MAX_IS_NEXT_DESC',
  SessionValidatorsMaxNextBestOrderAsc = 'SESSION_VALIDATORS_MAX_NEXT_BEST_ORDER_ASC',
  SessionValidatorsMaxNextBestOrderDesc = 'SESSION_VALIDATORS_MAX_NEXT_BEST_ORDER_DESC',
  SessionValidatorsMaxReputationAsc = 'SESSION_VALIDATORS_MAX_REPUTATION_ASC',
  SessionValidatorsMaxReputationDesc = 'SESSION_VALIDATORS_MAX_REPUTATION_DESC',
  SessionValidatorsMaxSessionIdAsc = 'SESSION_VALIDATORS_MAX_SESSION_ID_ASC',
  SessionValidatorsMaxSessionIdDesc = 'SESSION_VALIDATORS_MAX_SESSION_ID_DESC',
  SessionValidatorsMaxValidatorIdAsc = 'SESSION_VALIDATORS_MAX_VALIDATOR_ID_ASC',
  SessionValidatorsMaxValidatorIdDesc = 'SESSION_VALIDATORS_MAX_VALIDATOR_ID_DESC',
  SessionValidatorsMinBestOrderAsc = 'SESSION_VALIDATORS_MIN_BEST_ORDER_ASC',
  SessionValidatorsMinBestOrderDesc = 'SESSION_VALIDATORS_MIN_BEST_ORDER_DESC',
  SessionValidatorsMinIdAsc = 'SESSION_VALIDATORS_MIN_ID_ASC',
  SessionValidatorsMinIdDesc = 'SESSION_VALIDATORS_MIN_ID_DESC',
  SessionValidatorsMinIsBestAsc = 'SESSION_VALIDATORS_MIN_IS_BEST_ASC',
  SessionValidatorsMinIsBestDesc = 'SESSION_VALIDATORS_MIN_IS_BEST_DESC',
  SessionValidatorsMinIsNextAsc = 'SESSION_VALIDATORS_MIN_IS_NEXT_ASC',
  SessionValidatorsMinIsNextBestAsc = 'SESSION_VALIDATORS_MIN_IS_NEXT_BEST_ASC',
  SessionValidatorsMinIsNextBestDesc = 'SESSION_VALIDATORS_MIN_IS_NEXT_BEST_DESC',
  SessionValidatorsMinIsNextDesc = 'SESSION_VALIDATORS_MIN_IS_NEXT_DESC',
  SessionValidatorsMinNextBestOrderAsc = 'SESSION_VALIDATORS_MIN_NEXT_BEST_ORDER_ASC',
  SessionValidatorsMinNextBestOrderDesc = 'SESSION_VALIDATORS_MIN_NEXT_BEST_ORDER_DESC',
  SessionValidatorsMinReputationAsc = 'SESSION_VALIDATORS_MIN_REPUTATION_ASC',
  SessionValidatorsMinReputationDesc = 'SESSION_VALIDATORS_MIN_REPUTATION_DESC',
  SessionValidatorsMinSessionIdAsc = 'SESSION_VALIDATORS_MIN_SESSION_ID_ASC',
  SessionValidatorsMinSessionIdDesc = 'SESSION_VALIDATORS_MIN_SESSION_ID_DESC',
  SessionValidatorsMinValidatorIdAsc = 'SESSION_VALIDATORS_MIN_VALIDATOR_ID_ASC',
  SessionValidatorsMinValidatorIdDesc = 'SESSION_VALIDATORS_MIN_VALIDATOR_ID_DESC',
  SessionValidatorsStddevPopulationBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_BEST_ORDER_ASC',
  SessionValidatorsStddevPopulationBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_BEST_ORDER_DESC',
  SessionValidatorsStddevPopulationIdAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_ID_ASC',
  SessionValidatorsStddevPopulationIdDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_ID_DESC',
  SessionValidatorsStddevPopulationIsBestAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_BEST_ASC',
  SessionValidatorsStddevPopulationIsBestDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_BEST_DESC',
  SessionValidatorsStddevPopulationIsNextAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_ASC',
  SessionValidatorsStddevPopulationIsNextBestAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_BEST_ASC',
  SessionValidatorsStddevPopulationIsNextBestDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_BEST_DESC',
  SessionValidatorsStddevPopulationIsNextDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_DESC',
  SessionValidatorsStddevPopulationNextBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_NEXT_BEST_ORDER_ASC',
  SessionValidatorsStddevPopulationNextBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_NEXT_BEST_ORDER_DESC',
  SessionValidatorsStddevPopulationReputationAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_REPUTATION_ASC',
  SessionValidatorsStddevPopulationReputationDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_REPUTATION_DESC',
  SessionValidatorsStddevPopulationSessionIdAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_SESSION_ID_ASC',
  SessionValidatorsStddevPopulationSessionIdDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_SESSION_ID_DESC',
  SessionValidatorsStddevPopulationValidatorIdAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_VALIDATOR_ID_ASC',
  SessionValidatorsStddevPopulationValidatorIdDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_VALIDATOR_ID_DESC',
  SessionValidatorsStddevSampleBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_BEST_ORDER_ASC',
  SessionValidatorsStddevSampleBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_BEST_ORDER_DESC',
  SessionValidatorsStddevSampleIdAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_ID_ASC',
  SessionValidatorsStddevSampleIdDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_ID_DESC',
  SessionValidatorsStddevSampleIsBestAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_BEST_ASC',
  SessionValidatorsStddevSampleIsBestDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_BEST_DESC',
  SessionValidatorsStddevSampleIsNextAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_ASC',
  SessionValidatorsStddevSampleIsNextBestAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_BEST_ASC',
  SessionValidatorsStddevSampleIsNextBestDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_BEST_DESC',
  SessionValidatorsStddevSampleIsNextDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_DESC',
  SessionValidatorsStddevSampleNextBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_NEXT_BEST_ORDER_ASC',
  SessionValidatorsStddevSampleNextBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_NEXT_BEST_ORDER_DESC',
  SessionValidatorsStddevSampleReputationAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_REPUTATION_ASC',
  SessionValidatorsStddevSampleReputationDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_REPUTATION_DESC',
  SessionValidatorsStddevSampleSessionIdAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_SESSION_ID_ASC',
  SessionValidatorsStddevSampleSessionIdDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_SESSION_ID_DESC',
  SessionValidatorsStddevSampleValidatorIdAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_VALIDATOR_ID_ASC',
  SessionValidatorsStddevSampleValidatorIdDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_VALIDATOR_ID_DESC',
  SessionValidatorsSumBestOrderAsc = 'SESSION_VALIDATORS_SUM_BEST_ORDER_ASC',
  SessionValidatorsSumBestOrderDesc = 'SESSION_VALIDATORS_SUM_BEST_ORDER_DESC',
  SessionValidatorsSumIdAsc = 'SESSION_VALIDATORS_SUM_ID_ASC',
  SessionValidatorsSumIdDesc = 'SESSION_VALIDATORS_SUM_ID_DESC',
  SessionValidatorsSumIsBestAsc = 'SESSION_VALIDATORS_SUM_IS_BEST_ASC',
  SessionValidatorsSumIsBestDesc = 'SESSION_VALIDATORS_SUM_IS_BEST_DESC',
  SessionValidatorsSumIsNextAsc = 'SESSION_VALIDATORS_SUM_IS_NEXT_ASC',
  SessionValidatorsSumIsNextBestAsc = 'SESSION_VALIDATORS_SUM_IS_NEXT_BEST_ASC',
  SessionValidatorsSumIsNextBestDesc = 'SESSION_VALIDATORS_SUM_IS_NEXT_BEST_DESC',
  SessionValidatorsSumIsNextDesc = 'SESSION_VALIDATORS_SUM_IS_NEXT_DESC',
  SessionValidatorsSumNextBestOrderAsc = 'SESSION_VALIDATORS_SUM_NEXT_BEST_ORDER_ASC',
  SessionValidatorsSumNextBestOrderDesc = 'SESSION_VALIDATORS_SUM_NEXT_BEST_ORDER_DESC',
  SessionValidatorsSumReputationAsc = 'SESSION_VALIDATORS_SUM_REPUTATION_ASC',
  SessionValidatorsSumReputationDesc = 'SESSION_VALIDATORS_SUM_REPUTATION_DESC',
  SessionValidatorsSumSessionIdAsc = 'SESSION_VALIDATORS_SUM_SESSION_ID_ASC',
  SessionValidatorsSumSessionIdDesc = 'SESSION_VALIDATORS_SUM_SESSION_ID_DESC',
  SessionValidatorsSumValidatorIdAsc = 'SESSION_VALIDATORS_SUM_VALIDATOR_ID_ASC',
  SessionValidatorsSumValidatorIdDesc = 'SESSION_VALIDATORS_SUM_VALIDATOR_ID_DESC',
  SessionValidatorsVariancePopulationBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_BEST_ORDER_ASC',
  SessionValidatorsVariancePopulationBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_BEST_ORDER_DESC',
  SessionValidatorsVariancePopulationIdAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_ID_ASC',
  SessionValidatorsVariancePopulationIdDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_ID_DESC',
  SessionValidatorsVariancePopulationIsBestAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_BEST_ASC',
  SessionValidatorsVariancePopulationIsBestDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_BEST_DESC',
  SessionValidatorsVariancePopulationIsNextAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_ASC',
  SessionValidatorsVariancePopulationIsNextBestAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_BEST_ASC',
  SessionValidatorsVariancePopulationIsNextBestDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_BEST_DESC',
  SessionValidatorsVariancePopulationIsNextDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_DESC',
  SessionValidatorsVariancePopulationNextBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_NEXT_BEST_ORDER_ASC',
  SessionValidatorsVariancePopulationNextBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_NEXT_BEST_ORDER_DESC',
  SessionValidatorsVariancePopulationReputationAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_REPUTATION_ASC',
  SessionValidatorsVariancePopulationReputationDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_REPUTATION_DESC',
  SessionValidatorsVariancePopulationSessionIdAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_SESSION_ID_ASC',
  SessionValidatorsVariancePopulationSessionIdDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_SESSION_ID_DESC',
  SessionValidatorsVariancePopulationValidatorIdAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_VALIDATOR_ID_ASC',
  SessionValidatorsVariancePopulationValidatorIdDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_VALIDATOR_ID_DESC',
  SessionValidatorsVarianceSampleBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_BEST_ORDER_ASC',
  SessionValidatorsVarianceSampleBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_BEST_ORDER_DESC',
  SessionValidatorsVarianceSampleIdAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_ID_ASC',
  SessionValidatorsVarianceSampleIdDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_ID_DESC',
  SessionValidatorsVarianceSampleIsBestAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_BEST_ASC',
  SessionValidatorsVarianceSampleIsBestDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_BEST_DESC',
  SessionValidatorsVarianceSampleIsNextAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_ASC',
  SessionValidatorsVarianceSampleIsNextBestAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_BEST_ASC',
  SessionValidatorsVarianceSampleIsNextBestDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_BEST_DESC',
  SessionValidatorsVarianceSampleIsNextDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_DESC',
  SessionValidatorsVarianceSampleNextBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_NEXT_BEST_ORDER_ASC',
  SessionValidatorsVarianceSampleNextBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_NEXT_BEST_ORDER_DESC',
  SessionValidatorsVarianceSampleReputationAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_REPUTATION_ASC',
  SessionValidatorsVarianceSampleReputationDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_REPUTATION_DESC',
  SessionValidatorsVarianceSampleSessionIdAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_SESSION_ID_ASC',
  SessionValidatorsVarianceSampleSessionIdDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_SESSION_ID_DESC',
  SessionValidatorsVarianceSampleValidatorIdAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_VALIDATOR_ID_ASC',
  SessionValidatorsVarianceSampleValidatorIdDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_VALIDATOR_ID_DESC',
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

export type UnsignedProposalsQueue = Node & {
  __typename?: 'UnsignedProposalsQueue';
  /** Reads a single `Block` that is related to this `UnsignedProposalsQueue`. */
  block?: Maybe<Block>;
  blockId: Scalars['String'];
  blockNumber: Scalars['Int'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads and enables pagination through a set of `ProposalItem`. */
  proposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalId: UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyConnection;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueueItem`. */
  unsignedProposalsQueueItemsByQueueId: UnsignedProposalsQueueItemsConnection;
};

export type UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<ProposalItemFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<ProposalItemsOrderBy>>;
};

export type UnsignedProposalsQueueUnsignedProposalsQueueItemsByQueueIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<UnsignedProposalsQueueItemFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<UnsignedProposalsQueueItemsOrderBy>>;
};

export type UnsignedProposalsQueueAggregates = {
  __typename?: 'UnsignedProposalsQueueAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<UnsignedProposalsQueueAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<UnsignedProposalsQueueDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<UnsignedProposalsQueueMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<UnsignedProposalsQueueMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<UnsignedProposalsQueueStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<UnsignedProposalsQueueStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<UnsignedProposalsQueueSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<UnsignedProposalsQueueVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<UnsignedProposalsQueueVarianceSampleAggregates>;
};

export type UnsignedProposalsQueueAverageAggregates = {
  __typename?: 'UnsignedProposalsQueueAverageAggregates';
  /** Mean average of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueDistinctCountAggregates = {
  __typename?: 'UnsignedProposalsQueueDistinctCountAggregates';
  /** Distinct count of blockId across the matching connection */
  blockId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `UnsignedProposalsQueue` object types. All fields are combined with a logical ‘and.’ */
export type UnsignedProposalsQueueFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<UnsignedProposalsQueueFilter>>;
  /** Filter by the object’s `blockId` field. */
  blockId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<UnsignedProposalsQueueFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<UnsignedProposalsQueueFilter>>;
};

export type UnsignedProposalsQueueItem = Node & {
  __typename?: 'UnsignedProposalsQueueItem';
  blockNumber: Scalars['Int'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads a single `ProposalItem` that is related to this `UnsignedProposalsQueueItem`. */
  proposal?: Maybe<ProposalItem>;
  proposalId: Scalars['String'];
  /** Reads a single `UnsignedProposalsQueue` that is related to this `UnsignedProposalsQueueItem`. */
  queue?: Maybe<UnsignedProposalsQueue>;
  queueId: Scalars['String'];
};

export type UnsignedProposalsQueueItemAggregates = {
  __typename?: 'UnsignedProposalsQueueItemAggregates';
  /** Mean average aggregates across the matching connection (ignoring before/after/first/last/offset) */
  average?: Maybe<UnsignedProposalsQueueItemAverageAggregates>;
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<UnsignedProposalsQueueItemDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
  /** Maximum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  max?: Maybe<UnsignedProposalsQueueItemMaxAggregates>;
  /** Minimum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  min?: Maybe<UnsignedProposalsQueueItemMinAggregates>;
  /** Population standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevPopulation?: Maybe<UnsignedProposalsQueueItemStddevPopulationAggregates>;
  /** Sample standard deviation aggregates across the matching connection (ignoring before/after/first/last/offset) */
  stddevSample?: Maybe<UnsignedProposalsQueueItemStddevSampleAggregates>;
  /** Sum aggregates across the matching connection (ignoring before/after/first/last/offset) */
  sum?: Maybe<UnsignedProposalsQueueItemSumAggregates>;
  /** Population variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  variancePopulation?: Maybe<UnsignedProposalsQueueItemVariancePopulationAggregates>;
  /** Sample variance aggregates across the matching connection (ignoring before/after/first/last/offset) */
  varianceSample?: Maybe<UnsignedProposalsQueueItemVarianceSampleAggregates>;
};

export type UnsignedProposalsQueueItemAverageAggregates = {
  __typename?: 'UnsignedProposalsQueueItemAverageAggregates';
  /** Mean average of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueItemDistinctCountAggregates = {
  __typename?: 'UnsignedProposalsQueueItemDistinctCountAggregates';
  /** Distinct count of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
  /** Distinct count of proposalId across the matching connection */
  proposalId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of queueId across the matching connection */
  queueId?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `UnsignedProposalsQueueItem` object types. All fields are combined with a logical ‘and.’ */
export type UnsignedProposalsQueueItemFilter = {
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<UnsignedProposalsQueueItemFilter>>;
  /** Filter by the object’s `blockNumber` field. */
  blockNumber?: InputMaybe<IntFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<UnsignedProposalsQueueItemFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<UnsignedProposalsQueueItemFilter>>;
  /** Filter by the object’s `proposalId` field. */
  proposalId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `queueId` field. */
  queueId?: InputMaybe<StringFilter>;
};

export type UnsignedProposalsQueueItemMaxAggregates = {
  __typename?: 'UnsignedProposalsQueueItemMaxAggregates';
  /** Maximum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
};

export type UnsignedProposalsQueueItemMinAggregates = {
  __typename?: 'UnsignedProposalsQueueItemMinAggregates';
  /** Minimum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
};

export type UnsignedProposalsQueueItemStddevPopulationAggregates = {
  __typename?: 'UnsignedProposalsQueueItemStddevPopulationAggregates';
  /** Population standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueItemStddevSampleAggregates = {
  __typename?: 'UnsignedProposalsQueueItemStddevSampleAggregates';
  /** Sample standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueItemSumAggregates = {
  __typename?: 'UnsignedProposalsQueueItemSumAggregates';
  /** Sum of blockNumber across the matching connection */
  blockNumber: Scalars['BigInt'];
};

export type UnsignedProposalsQueueItemVariancePopulationAggregates = {
  __typename?: 'UnsignedProposalsQueueItemVariancePopulationAggregates';
  /** Population variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueItemVarianceSampleAggregates = {
  __typename?: 'UnsignedProposalsQueueItemVarianceSampleAggregates';
  /** Sample variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `UnsignedProposalsQueueItem` values. */
export type UnsignedProposalsQueueItemsConnection = {
  __typename?: 'UnsignedProposalsQueueItemsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<UnsignedProposalsQueueItemAggregates>;
  /** A list of edges which contains the `UnsignedProposalsQueueItem` and cursor to aid in pagination. */
  edges: Array<UnsignedProposalsQueueItemsEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<UnsignedProposalsQueueItemAggregates>>;
  /** A list of `UnsignedProposalsQueueItem` objects. */
  nodes: Array<Maybe<UnsignedProposalsQueueItem>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `UnsignedProposalsQueueItem` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `UnsignedProposalsQueueItem` values. */
export type UnsignedProposalsQueueItemsConnectionGroupedAggregatesArgs = {
  groupBy: Array<UnsignedProposalsQueueItemsGroupBy>;
  having?: InputMaybe<UnsignedProposalsQueueItemsHavingInput>;
};

/** A `UnsignedProposalsQueueItem` edge in the connection. */
export type UnsignedProposalsQueueItemsEdge = {
  __typename?: 'UnsignedProposalsQueueItemsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `UnsignedProposalsQueueItem` at the end of the edge. */
  node?: Maybe<UnsignedProposalsQueueItem>;
};

/** Grouping methods for `UnsignedProposalsQueueItem` for usage during aggregation. */
export enum UnsignedProposalsQueueItemsGroupBy {
  BlockNumber = 'BLOCK_NUMBER',
  ProposalId = 'PROPOSAL_ID',
  QueueId = 'QUEUE_ID',
}

export type UnsignedProposalsQueueItemsHavingAverageInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueueItemsHavingDistinctCountInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `UnsignedProposalsQueueItem` aggregates. */
export type UnsignedProposalsQueueItemsHavingInput = {
  AND?: InputMaybe<Array<UnsignedProposalsQueueItemsHavingInput>>;
  OR?: InputMaybe<Array<UnsignedProposalsQueueItemsHavingInput>>;
  average?: InputMaybe<UnsignedProposalsQueueItemsHavingAverageInput>;
  distinctCount?: InputMaybe<UnsignedProposalsQueueItemsHavingDistinctCountInput>;
  max?: InputMaybe<UnsignedProposalsQueueItemsHavingMaxInput>;
  min?: InputMaybe<UnsignedProposalsQueueItemsHavingMinInput>;
  stddevPopulation?: InputMaybe<UnsignedProposalsQueueItemsHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<UnsignedProposalsQueueItemsHavingStddevSampleInput>;
  sum?: InputMaybe<UnsignedProposalsQueueItemsHavingSumInput>;
  variancePopulation?: InputMaybe<UnsignedProposalsQueueItemsHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<UnsignedProposalsQueueItemsHavingVarianceSampleInput>;
};

export type UnsignedProposalsQueueItemsHavingMaxInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueueItemsHavingMinInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueueItemsHavingStddevPopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueueItemsHavingStddevSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueueItemsHavingSumInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueueItemsHavingVariancePopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueueItemsHavingVarianceSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `UnsignedProposalsQueueItem`. */
export enum UnsignedProposalsQueueItemsOrderBy {
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  ProposalIdAsc = 'PROPOSAL_ID_ASC',
  ProposalIdDesc = 'PROPOSAL_ID_DESC',
  QueueIdAsc = 'QUEUE_ID_ASC',
  QueueIdDesc = 'QUEUE_ID_DESC',
}

export type UnsignedProposalsQueueMaxAggregates = {
  __typename?: 'UnsignedProposalsQueueMaxAggregates';
  /** Maximum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
};

export type UnsignedProposalsQueueMinAggregates = {
  __typename?: 'UnsignedProposalsQueueMinAggregates';
  /** Minimum of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['Int']>;
};

/** A connection to a list of `ProposalItem` values, with data from `UnsignedProposalsQueueItem`. */
export type UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyConnection = {
  __typename?: 'UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ProposalItemAggregates>;
  /** A list of edges which contains the `ProposalItem`, info from the `UnsignedProposalsQueueItem`, and the cursor to aid in pagination. */
  edges: Array<UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<ProposalItemAggregates>>;
  /** A list of `ProposalItem` objects. */
  nodes: Array<Maybe<ProposalItem>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `ProposalItem` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `ProposalItem` values, with data from `UnsignedProposalsQueueItem`. */
export type UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyConnectionGroupedAggregatesArgs =
  {
    groupBy: Array<ProposalItemsGroupBy>;
    having?: InputMaybe<ProposalItemsHavingInput>;
  };

/** A `ProposalItem` edge in the connection, with data from `UnsignedProposalsQueueItem`. */
export type UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyEdge = {
  __typename?: 'UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `ProposalItem` at the end of the edge. */
  node?: Maybe<ProposalItem>;
  /** Reads and enables pagination through a set of `UnsignedProposalsQueueItem`. */
  unsignedProposalsQueueItemsByProposalId: UnsignedProposalsQueueItemsConnection;
};

/** A `ProposalItem` edge in the connection, with data from `UnsignedProposalsQueueItem`. */
export type UnsignedProposalsQueueProposalItemsByUnsignedProposalsQueueItemQueueIdAndProposalIdManyToManyEdgeUnsignedProposalsQueueItemsByProposalIdArgs =
  {
    after?: InputMaybe<Scalars['Cursor']>;
    before?: InputMaybe<Scalars['Cursor']>;
    filter?: InputMaybe<UnsignedProposalsQueueItemFilter>;
    first?: InputMaybe<Scalars['Int']>;
    last?: InputMaybe<Scalars['Int']>;
    offset?: InputMaybe<Scalars['Int']>;
    orderBy?: InputMaybe<Array<UnsignedProposalsQueueItemsOrderBy>>;
  };

export type UnsignedProposalsQueueStddevPopulationAggregates = {
  __typename?: 'UnsignedProposalsQueueStddevPopulationAggregates';
  /** Population standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueStddevSampleAggregates = {
  __typename?: 'UnsignedProposalsQueueStddevSampleAggregates';
  /** Sample standard deviation of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueSumAggregates = {
  __typename?: 'UnsignedProposalsQueueSumAggregates';
  /** Sum of blockNumber across the matching connection */
  blockNumber: Scalars['BigInt'];
};

export type UnsignedProposalsQueueVariancePopulationAggregates = {
  __typename?: 'UnsignedProposalsQueueVariancePopulationAggregates';
  /** Population variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

export type UnsignedProposalsQueueVarianceSampleAggregates = {
  __typename?: 'UnsignedProposalsQueueVarianceSampleAggregates';
  /** Sample variance of blockNumber across the matching connection */
  blockNumber?: Maybe<Scalars['BigFloat']>;
};

/** A connection to a list of `UnsignedProposalsQueue` values. */
export type UnsignedProposalsQueuesConnection = {
  __typename?: 'UnsignedProposalsQueuesConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<UnsignedProposalsQueueAggregates>;
  /** A list of edges which contains the `UnsignedProposalsQueue` and cursor to aid in pagination. */
  edges: Array<UnsignedProposalsQueuesEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<UnsignedProposalsQueueAggregates>>;
  /** A list of `UnsignedProposalsQueue` objects. */
  nodes: Array<Maybe<UnsignedProposalsQueue>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `UnsignedProposalsQueue` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `UnsignedProposalsQueue` values. */
export type UnsignedProposalsQueuesConnectionGroupedAggregatesArgs = {
  groupBy: Array<UnsignedProposalsQueuesGroupBy>;
  having?: InputMaybe<UnsignedProposalsQueuesHavingInput>;
};

/** A `UnsignedProposalsQueue` edge in the connection. */
export type UnsignedProposalsQueuesEdge = {
  __typename?: 'UnsignedProposalsQueuesEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `UnsignedProposalsQueue` at the end of the edge. */
  node?: Maybe<UnsignedProposalsQueue>;
};

/** Grouping methods for `UnsignedProposalsQueue` for usage during aggregation. */
export enum UnsignedProposalsQueuesGroupBy {
  BlockId = 'BLOCK_ID',
  BlockNumber = 'BLOCK_NUMBER',
}

export type UnsignedProposalsQueuesHavingAverageInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueuesHavingDistinctCountInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

/** Conditions for `UnsignedProposalsQueue` aggregates. */
export type UnsignedProposalsQueuesHavingInput = {
  AND?: InputMaybe<Array<UnsignedProposalsQueuesHavingInput>>;
  OR?: InputMaybe<Array<UnsignedProposalsQueuesHavingInput>>;
  average?: InputMaybe<UnsignedProposalsQueuesHavingAverageInput>;
  distinctCount?: InputMaybe<UnsignedProposalsQueuesHavingDistinctCountInput>;
  max?: InputMaybe<UnsignedProposalsQueuesHavingMaxInput>;
  min?: InputMaybe<UnsignedProposalsQueuesHavingMinInput>;
  stddevPopulation?: InputMaybe<UnsignedProposalsQueuesHavingStddevPopulationInput>;
  stddevSample?: InputMaybe<UnsignedProposalsQueuesHavingStddevSampleInput>;
  sum?: InputMaybe<UnsignedProposalsQueuesHavingSumInput>;
  variancePopulation?: InputMaybe<UnsignedProposalsQueuesHavingVariancePopulationInput>;
  varianceSample?: InputMaybe<UnsignedProposalsQueuesHavingVarianceSampleInput>;
};

export type UnsignedProposalsQueuesHavingMaxInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueuesHavingMinInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueuesHavingStddevPopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueuesHavingStddevSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueuesHavingSumInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueuesHavingVariancePopulationInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

export type UnsignedProposalsQueuesHavingVarianceSampleInput = {
  blockNumber?: InputMaybe<HavingIntFilter>;
};

/** Methods to use when ordering `UnsignedProposalsQueue`. */
export enum UnsignedProposalsQueuesOrderBy {
  BlockIdAsc = 'BLOCK_ID_ASC',
  BlockIdDesc = 'BLOCK_ID_DESC',
  BlockNumberAsc = 'BLOCK_NUMBER_ASC',
  BlockNumberDesc = 'BLOCK_NUMBER_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  UnsignedProposalsQueueItemsByQueueIdAverageBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdAverageBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdAverageIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdAverageIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdAverageProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdAverageProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdAverageQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdAverageQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_AVERAGE_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdCountAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_COUNT_ASC',
  UnsignedProposalsQueueItemsByQueueIdCountDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_COUNT_DESC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdDistinctCountQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_DISTINCT_COUNT_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdMaxBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdMaxBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdMaxIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdMaxIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdMaxProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdMaxProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdMaxQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdMaxQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MAX_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdMinBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdMinBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdMinIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdMinIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdMinProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdMinProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdMinQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdMinQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_MIN_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevPopulationQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_POPULATION_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdStddevSampleQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_STDDEV_SAMPLE_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdSumBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdSumBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdSumIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdSumIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdSumProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdSumProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdSumQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdSumQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_SUM_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdVariancePopulationQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_POPULATION_QUEUE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleBlockNumberAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_BLOCK_NUMBER_ASC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleBlockNumberDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_BLOCK_NUMBER_DESC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleProposalIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_PROPOSAL_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleProposalIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_PROPOSAL_ID_DESC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleQueueIdAsc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_QUEUE_ID_ASC',
  UnsignedProposalsQueueItemsByQueueIdVarianceSampleQueueIdDesc = 'UNSIGNED_PROPOSALS_QUEUE_ITEMS_BY_QUEUE_ID_VARIANCE_SAMPLE_QUEUE_ID_DESC',
}

export type Validator = Node & {
  __typename?: 'Validator';
  accountId: Scalars['String'];
  authorityId: Scalars['String'];
  id: Scalars['String'];
  /** A globally unique identifier. Can be used in various places throughout the system to identify this single value. */
  nodeId: Scalars['ID'];
  /** Reads and enables pagination through a set of `SessionValidator`. */
  sessionValidators: SessionValidatorsConnection;
  /** Reads and enables pagination through a set of `Session`. */
  sessionsBySessionValidatorValidatorIdAndSessionId: ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyConnection;
};

export type ValidatorSessionValidatorsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionValidatorFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionValidatorsOrderBy>>;
};

export type ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionsOrderBy>>;
};

export type ValidatorAggregates = {
  __typename?: 'ValidatorAggregates';
  /** Distinct count aggregates across the matching connection (ignoring before/after/first/last/offset) */
  distinctCount?: Maybe<ValidatorDistinctCountAggregates>;
  keys?: Maybe<Array<Scalars['String']>>;
};

export type ValidatorDistinctCountAggregates = {
  __typename?: 'ValidatorDistinctCountAggregates';
  /** Distinct count of accountId across the matching connection */
  accountId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of authorityId across the matching connection */
  authorityId?: Maybe<Scalars['BigInt']>;
  /** Distinct count of id across the matching connection */
  id?: Maybe<Scalars['BigInt']>;
};

/** A filter to be used against `Validator` object types. All fields are combined with a logical ‘and.’ */
export type ValidatorFilter = {
  /** Filter by the object’s `accountId` field. */
  accountId?: InputMaybe<StringFilter>;
  /** Checks for all expressions in this list. */
  and?: InputMaybe<Array<ValidatorFilter>>;
  /** Filter by the object’s `authorityId` field. */
  authorityId?: InputMaybe<StringFilter>;
  /** Filter by the object’s `id` field. */
  id?: InputMaybe<StringFilter>;
  /** Negates the expression. */
  not?: InputMaybe<ValidatorFilter>;
  /** Checks for any expressions in this list. */
  or?: InputMaybe<Array<ValidatorFilter>>;
};

/** A connection to a list of `Session` values, with data from `SessionValidator`. */
export type ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyConnection = {
  __typename?: 'ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<SessionAggregates>;
  /** A list of edges which contains the `Session`, info from the `SessionValidator`, and the cursor to aid in pagination. */
  edges: Array<ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyEdge>;
  /** Grouped aggregates across the matching connection (ignoring before/after/first/last/offset) */
  groupedAggregates?: Maybe<Array<SessionAggregates>>;
  /** A list of `Session` objects. */
  nodes: Array<Maybe<Session>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Session` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A connection to a list of `Session` values, with data from `SessionValidator`. */
export type ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyConnectionGroupedAggregatesArgs = {
  groupBy: Array<SessionsGroupBy>;
  having?: InputMaybe<SessionsHavingInput>;
};

/** A `Session` edge in the connection, with data from `SessionValidator`. */
export type ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyEdge = {
  __typename?: 'ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Session` at the end of the edge. */
  node?: Maybe<Session>;
  /** Reads and enables pagination through a set of `SessionValidator`. */
  sessionValidators: SessionValidatorsConnection;
};

/** A `Session` edge in the connection, with data from `SessionValidator`. */
export type ValidatorSessionsBySessionValidatorValidatorIdAndSessionIdManyToManyEdgeSessionValidatorsArgs = {
  after?: InputMaybe<Scalars['Cursor']>;
  before?: InputMaybe<Scalars['Cursor']>;
  filter?: InputMaybe<SessionValidatorFilter>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Array<SessionValidatorsOrderBy>>;
};

/** A connection to a list of `Validator` values. */
export type ValidatorsConnection = {
  __typename?: 'ValidatorsConnection';
  /** Aggregates across the matching connection (ignoring before/after/first/last/offset) */
  aggregates?: Maybe<ValidatorAggregates>;
  /** A list of edges which contains the `Validator` and cursor to aid in pagination. */
  edges: Array<ValidatorsEdge>;
  /** A list of `Validator` objects. */
  nodes: Array<Maybe<Validator>>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** The count of *all* `Validator` you could get from the connection. */
  totalCount: Scalars['Int'];
};

/** A `Validator` edge in the connection. */
export type ValidatorsEdge = {
  __typename?: 'ValidatorsEdge';
  /** A cursor for use in pagination. */
  cursor?: Maybe<Scalars['Cursor']>;
  /** The `Validator` at the end of the edge. */
  node?: Maybe<Validator>;
};

/** Methods to use when ordering `Validator`. */
export enum ValidatorsOrderBy {
  AccountIdAsc = 'ACCOUNT_ID_ASC',
  AccountIdDesc = 'ACCOUNT_ID_DESC',
  AuthorityIdAsc = 'AUTHORITY_ID_ASC',
  AuthorityIdDesc = 'AUTHORITY_ID_DESC',
  IdAsc = 'ID_ASC',
  IdDesc = 'ID_DESC',
  Natural = 'NATURAL',
  PrimaryKeyAsc = 'PRIMARY_KEY_ASC',
  PrimaryKeyDesc = 'PRIMARY_KEY_DESC',
  SessionValidatorsAverageBestOrderAsc = 'SESSION_VALIDATORS_AVERAGE_BEST_ORDER_ASC',
  SessionValidatorsAverageBestOrderDesc = 'SESSION_VALIDATORS_AVERAGE_BEST_ORDER_DESC',
  SessionValidatorsAverageIdAsc = 'SESSION_VALIDATORS_AVERAGE_ID_ASC',
  SessionValidatorsAverageIdDesc = 'SESSION_VALIDATORS_AVERAGE_ID_DESC',
  SessionValidatorsAverageIsBestAsc = 'SESSION_VALIDATORS_AVERAGE_IS_BEST_ASC',
  SessionValidatorsAverageIsBestDesc = 'SESSION_VALIDATORS_AVERAGE_IS_BEST_DESC',
  SessionValidatorsAverageIsNextAsc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_ASC',
  SessionValidatorsAverageIsNextBestAsc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_BEST_ASC',
  SessionValidatorsAverageIsNextBestDesc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_BEST_DESC',
  SessionValidatorsAverageIsNextDesc = 'SESSION_VALIDATORS_AVERAGE_IS_NEXT_DESC',
  SessionValidatorsAverageNextBestOrderAsc = 'SESSION_VALIDATORS_AVERAGE_NEXT_BEST_ORDER_ASC',
  SessionValidatorsAverageNextBestOrderDesc = 'SESSION_VALIDATORS_AVERAGE_NEXT_BEST_ORDER_DESC',
  SessionValidatorsAverageReputationAsc = 'SESSION_VALIDATORS_AVERAGE_REPUTATION_ASC',
  SessionValidatorsAverageReputationDesc = 'SESSION_VALIDATORS_AVERAGE_REPUTATION_DESC',
  SessionValidatorsAverageSessionIdAsc = 'SESSION_VALIDATORS_AVERAGE_SESSION_ID_ASC',
  SessionValidatorsAverageSessionIdDesc = 'SESSION_VALIDATORS_AVERAGE_SESSION_ID_DESC',
  SessionValidatorsAverageValidatorIdAsc = 'SESSION_VALIDATORS_AVERAGE_VALIDATOR_ID_ASC',
  SessionValidatorsAverageValidatorIdDesc = 'SESSION_VALIDATORS_AVERAGE_VALIDATOR_ID_DESC',
  SessionValidatorsCountAsc = 'SESSION_VALIDATORS_COUNT_ASC',
  SessionValidatorsCountDesc = 'SESSION_VALIDATORS_COUNT_DESC',
  SessionValidatorsDistinctCountBestOrderAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_BEST_ORDER_ASC',
  SessionValidatorsDistinctCountBestOrderDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_BEST_ORDER_DESC',
  SessionValidatorsDistinctCountIdAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_ID_ASC',
  SessionValidatorsDistinctCountIdDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_ID_DESC',
  SessionValidatorsDistinctCountIsBestAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_BEST_ASC',
  SessionValidatorsDistinctCountIsBestDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_BEST_DESC',
  SessionValidatorsDistinctCountIsNextAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_ASC',
  SessionValidatorsDistinctCountIsNextBestAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_BEST_ASC',
  SessionValidatorsDistinctCountIsNextBestDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_BEST_DESC',
  SessionValidatorsDistinctCountIsNextDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_IS_NEXT_DESC',
  SessionValidatorsDistinctCountNextBestOrderAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_NEXT_BEST_ORDER_ASC',
  SessionValidatorsDistinctCountNextBestOrderDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_NEXT_BEST_ORDER_DESC',
  SessionValidatorsDistinctCountReputationAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_REPUTATION_ASC',
  SessionValidatorsDistinctCountReputationDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_REPUTATION_DESC',
  SessionValidatorsDistinctCountSessionIdAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_SESSION_ID_ASC',
  SessionValidatorsDistinctCountSessionIdDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_SESSION_ID_DESC',
  SessionValidatorsDistinctCountValidatorIdAsc = 'SESSION_VALIDATORS_DISTINCT_COUNT_VALIDATOR_ID_ASC',
  SessionValidatorsDistinctCountValidatorIdDesc = 'SESSION_VALIDATORS_DISTINCT_COUNT_VALIDATOR_ID_DESC',
  SessionValidatorsMaxBestOrderAsc = 'SESSION_VALIDATORS_MAX_BEST_ORDER_ASC',
  SessionValidatorsMaxBestOrderDesc = 'SESSION_VALIDATORS_MAX_BEST_ORDER_DESC',
  SessionValidatorsMaxIdAsc = 'SESSION_VALIDATORS_MAX_ID_ASC',
  SessionValidatorsMaxIdDesc = 'SESSION_VALIDATORS_MAX_ID_DESC',
  SessionValidatorsMaxIsBestAsc = 'SESSION_VALIDATORS_MAX_IS_BEST_ASC',
  SessionValidatorsMaxIsBestDesc = 'SESSION_VALIDATORS_MAX_IS_BEST_DESC',
  SessionValidatorsMaxIsNextAsc = 'SESSION_VALIDATORS_MAX_IS_NEXT_ASC',
  SessionValidatorsMaxIsNextBestAsc = 'SESSION_VALIDATORS_MAX_IS_NEXT_BEST_ASC',
  SessionValidatorsMaxIsNextBestDesc = 'SESSION_VALIDATORS_MAX_IS_NEXT_BEST_DESC',
  SessionValidatorsMaxIsNextDesc = 'SESSION_VALIDATORS_MAX_IS_NEXT_DESC',
  SessionValidatorsMaxNextBestOrderAsc = 'SESSION_VALIDATORS_MAX_NEXT_BEST_ORDER_ASC',
  SessionValidatorsMaxNextBestOrderDesc = 'SESSION_VALIDATORS_MAX_NEXT_BEST_ORDER_DESC',
  SessionValidatorsMaxReputationAsc = 'SESSION_VALIDATORS_MAX_REPUTATION_ASC',
  SessionValidatorsMaxReputationDesc = 'SESSION_VALIDATORS_MAX_REPUTATION_DESC',
  SessionValidatorsMaxSessionIdAsc = 'SESSION_VALIDATORS_MAX_SESSION_ID_ASC',
  SessionValidatorsMaxSessionIdDesc = 'SESSION_VALIDATORS_MAX_SESSION_ID_DESC',
  SessionValidatorsMaxValidatorIdAsc = 'SESSION_VALIDATORS_MAX_VALIDATOR_ID_ASC',
  SessionValidatorsMaxValidatorIdDesc = 'SESSION_VALIDATORS_MAX_VALIDATOR_ID_DESC',
  SessionValidatorsMinBestOrderAsc = 'SESSION_VALIDATORS_MIN_BEST_ORDER_ASC',
  SessionValidatorsMinBestOrderDesc = 'SESSION_VALIDATORS_MIN_BEST_ORDER_DESC',
  SessionValidatorsMinIdAsc = 'SESSION_VALIDATORS_MIN_ID_ASC',
  SessionValidatorsMinIdDesc = 'SESSION_VALIDATORS_MIN_ID_DESC',
  SessionValidatorsMinIsBestAsc = 'SESSION_VALIDATORS_MIN_IS_BEST_ASC',
  SessionValidatorsMinIsBestDesc = 'SESSION_VALIDATORS_MIN_IS_BEST_DESC',
  SessionValidatorsMinIsNextAsc = 'SESSION_VALIDATORS_MIN_IS_NEXT_ASC',
  SessionValidatorsMinIsNextBestAsc = 'SESSION_VALIDATORS_MIN_IS_NEXT_BEST_ASC',
  SessionValidatorsMinIsNextBestDesc = 'SESSION_VALIDATORS_MIN_IS_NEXT_BEST_DESC',
  SessionValidatorsMinIsNextDesc = 'SESSION_VALIDATORS_MIN_IS_NEXT_DESC',
  SessionValidatorsMinNextBestOrderAsc = 'SESSION_VALIDATORS_MIN_NEXT_BEST_ORDER_ASC',
  SessionValidatorsMinNextBestOrderDesc = 'SESSION_VALIDATORS_MIN_NEXT_BEST_ORDER_DESC',
  SessionValidatorsMinReputationAsc = 'SESSION_VALIDATORS_MIN_REPUTATION_ASC',
  SessionValidatorsMinReputationDesc = 'SESSION_VALIDATORS_MIN_REPUTATION_DESC',
  SessionValidatorsMinSessionIdAsc = 'SESSION_VALIDATORS_MIN_SESSION_ID_ASC',
  SessionValidatorsMinSessionIdDesc = 'SESSION_VALIDATORS_MIN_SESSION_ID_DESC',
  SessionValidatorsMinValidatorIdAsc = 'SESSION_VALIDATORS_MIN_VALIDATOR_ID_ASC',
  SessionValidatorsMinValidatorIdDesc = 'SESSION_VALIDATORS_MIN_VALIDATOR_ID_DESC',
  SessionValidatorsStddevPopulationBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_BEST_ORDER_ASC',
  SessionValidatorsStddevPopulationBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_BEST_ORDER_DESC',
  SessionValidatorsStddevPopulationIdAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_ID_ASC',
  SessionValidatorsStddevPopulationIdDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_ID_DESC',
  SessionValidatorsStddevPopulationIsBestAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_BEST_ASC',
  SessionValidatorsStddevPopulationIsBestDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_BEST_DESC',
  SessionValidatorsStddevPopulationIsNextAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_ASC',
  SessionValidatorsStddevPopulationIsNextBestAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_BEST_ASC',
  SessionValidatorsStddevPopulationIsNextBestDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_BEST_DESC',
  SessionValidatorsStddevPopulationIsNextDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_IS_NEXT_DESC',
  SessionValidatorsStddevPopulationNextBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_NEXT_BEST_ORDER_ASC',
  SessionValidatorsStddevPopulationNextBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_NEXT_BEST_ORDER_DESC',
  SessionValidatorsStddevPopulationReputationAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_REPUTATION_ASC',
  SessionValidatorsStddevPopulationReputationDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_REPUTATION_DESC',
  SessionValidatorsStddevPopulationSessionIdAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_SESSION_ID_ASC',
  SessionValidatorsStddevPopulationSessionIdDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_SESSION_ID_DESC',
  SessionValidatorsStddevPopulationValidatorIdAsc = 'SESSION_VALIDATORS_STDDEV_POPULATION_VALIDATOR_ID_ASC',
  SessionValidatorsStddevPopulationValidatorIdDesc = 'SESSION_VALIDATORS_STDDEV_POPULATION_VALIDATOR_ID_DESC',
  SessionValidatorsStddevSampleBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_BEST_ORDER_ASC',
  SessionValidatorsStddevSampleBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_BEST_ORDER_DESC',
  SessionValidatorsStddevSampleIdAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_ID_ASC',
  SessionValidatorsStddevSampleIdDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_ID_DESC',
  SessionValidatorsStddevSampleIsBestAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_BEST_ASC',
  SessionValidatorsStddevSampleIsBestDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_BEST_DESC',
  SessionValidatorsStddevSampleIsNextAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_ASC',
  SessionValidatorsStddevSampleIsNextBestAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_BEST_ASC',
  SessionValidatorsStddevSampleIsNextBestDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_BEST_DESC',
  SessionValidatorsStddevSampleIsNextDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_IS_NEXT_DESC',
  SessionValidatorsStddevSampleNextBestOrderAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_NEXT_BEST_ORDER_ASC',
  SessionValidatorsStddevSampleNextBestOrderDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_NEXT_BEST_ORDER_DESC',
  SessionValidatorsStddevSampleReputationAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_REPUTATION_ASC',
  SessionValidatorsStddevSampleReputationDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_REPUTATION_DESC',
  SessionValidatorsStddevSampleSessionIdAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_SESSION_ID_ASC',
  SessionValidatorsStddevSampleSessionIdDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_SESSION_ID_DESC',
  SessionValidatorsStddevSampleValidatorIdAsc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_VALIDATOR_ID_ASC',
  SessionValidatorsStddevSampleValidatorIdDesc = 'SESSION_VALIDATORS_STDDEV_SAMPLE_VALIDATOR_ID_DESC',
  SessionValidatorsSumBestOrderAsc = 'SESSION_VALIDATORS_SUM_BEST_ORDER_ASC',
  SessionValidatorsSumBestOrderDesc = 'SESSION_VALIDATORS_SUM_BEST_ORDER_DESC',
  SessionValidatorsSumIdAsc = 'SESSION_VALIDATORS_SUM_ID_ASC',
  SessionValidatorsSumIdDesc = 'SESSION_VALIDATORS_SUM_ID_DESC',
  SessionValidatorsSumIsBestAsc = 'SESSION_VALIDATORS_SUM_IS_BEST_ASC',
  SessionValidatorsSumIsBestDesc = 'SESSION_VALIDATORS_SUM_IS_BEST_DESC',
  SessionValidatorsSumIsNextAsc = 'SESSION_VALIDATORS_SUM_IS_NEXT_ASC',
  SessionValidatorsSumIsNextBestAsc = 'SESSION_VALIDATORS_SUM_IS_NEXT_BEST_ASC',
  SessionValidatorsSumIsNextBestDesc = 'SESSION_VALIDATORS_SUM_IS_NEXT_BEST_DESC',
  SessionValidatorsSumIsNextDesc = 'SESSION_VALIDATORS_SUM_IS_NEXT_DESC',
  SessionValidatorsSumNextBestOrderAsc = 'SESSION_VALIDATORS_SUM_NEXT_BEST_ORDER_ASC',
  SessionValidatorsSumNextBestOrderDesc = 'SESSION_VALIDATORS_SUM_NEXT_BEST_ORDER_DESC',
  SessionValidatorsSumReputationAsc = 'SESSION_VALIDATORS_SUM_REPUTATION_ASC',
  SessionValidatorsSumReputationDesc = 'SESSION_VALIDATORS_SUM_REPUTATION_DESC',
  SessionValidatorsSumSessionIdAsc = 'SESSION_VALIDATORS_SUM_SESSION_ID_ASC',
  SessionValidatorsSumSessionIdDesc = 'SESSION_VALIDATORS_SUM_SESSION_ID_DESC',
  SessionValidatorsSumValidatorIdAsc = 'SESSION_VALIDATORS_SUM_VALIDATOR_ID_ASC',
  SessionValidatorsSumValidatorIdDesc = 'SESSION_VALIDATORS_SUM_VALIDATOR_ID_DESC',
  SessionValidatorsVariancePopulationBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_BEST_ORDER_ASC',
  SessionValidatorsVariancePopulationBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_BEST_ORDER_DESC',
  SessionValidatorsVariancePopulationIdAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_ID_ASC',
  SessionValidatorsVariancePopulationIdDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_ID_DESC',
  SessionValidatorsVariancePopulationIsBestAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_BEST_ASC',
  SessionValidatorsVariancePopulationIsBestDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_BEST_DESC',
  SessionValidatorsVariancePopulationIsNextAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_ASC',
  SessionValidatorsVariancePopulationIsNextBestAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_BEST_ASC',
  SessionValidatorsVariancePopulationIsNextBestDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_BEST_DESC',
  SessionValidatorsVariancePopulationIsNextDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_IS_NEXT_DESC',
  SessionValidatorsVariancePopulationNextBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_NEXT_BEST_ORDER_ASC',
  SessionValidatorsVariancePopulationNextBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_NEXT_BEST_ORDER_DESC',
  SessionValidatorsVariancePopulationReputationAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_REPUTATION_ASC',
  SessionValidatorsVariancePopulationReputationDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_REPUTATION_DESC',
  SessionValidatorsVariancePopulationSessionIdAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_SESSION_ID_ASC',
  SessionValidatorsVariancePopulationSessionIdDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_SESSION_ID_DESC',
  SessionValidatorsVariancePopulationValidatorIdAsc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_VALIDATOR_ID_ASC',
  SessionValidatorsVariancePopulationValidatorIdDesc = 'SESSION_VALIDATORS_VARIANCE_POPULATION_VALIDATOR_ID_DESC',
  SessionValidatorsVarianceSampleBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_BEST_ORDER_ASC',
  SessionValidatorsVarianceSampleBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_BEST_ORDER_DESC',
  SessionValidatorsVarianceSampleIdAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_ID_ASC',
  SessionValidatorsVarianceSampleIdDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_ID_DESC',
  SessionValidatorsVarianceSampleIsBestAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_BEST_ASC',
  SessionValidatorsVarianceSampleIsBestDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_BEST_DESC',
  SessionValidatorsVarianceSampleIsNextAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_ASC',
  SessionValidatorsVarianceSampleIsNextBestAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_BEST_ASC',
  SessionValidatorsVarianceSampleIsNextBestDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_BEST_DESC',
  SessionValidatorsVarianceSampleIsNextDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_IS_NEXT_DESC',
  SessionValidatorsVarianceSampleNextBestOrderAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_NEXT_BEST_ORDER_ASC',
  SessionValidatorsVarianceSampleNextBestOrderDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_NEXT_BEST_ORDER_DESC',
  SessionValidatorsVarianceSampleReputationAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_REPUTATION_ASC',
  SessionValidatorsVarianceSampleReputationDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_REPUTATION_DESC',
  SessionValidatorsVarianceSampleSessionIdAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_SESSION_ID_ASC',
  SessionValidatorsVarianceSampleSessionIdDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_SESSION_ID_DESC',
  SessionValidatorsVarianceSampleValidatorIdAsc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_VALIDATOR_ID_ASC',
  SessionValidatorsVarianceSampleValidatorIdDesc = 'SESSION_VALIDATORS_VARIANCE_SAMPLE_VALIDATOR_ID_DESC',
}

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

export type ValidatorListingQueryVariables = Exact<{
  sessionId: Scalars['String'];
  perPage: Scalars['Int'];
  offset: Scalars['Int'];
}>;

export type ValidatorListingQuery = {
  __typename?: 'Query';
  validators?: {
    __typename?: 'ValidatorsConnection';
    totalCount: number;
    nodes: Array<{
      __typename?: 'Validator';
      authorityId: string;
      id: string;
      sessionValidators: {
        __typename?: 'SessionValidatorsConnection';
        edges: Array<{
          __typename?: 'SessionValidatorsEdge';
          node?: {
            __typename?: 'SessionValidator';
            id: string;
            sessionId: string;
            reputation: string;
            isBest: boolean;
            isNext: boolean;
            isNextBest: boolean;
            bestOrder: number;
            nextBestOrder: number;
            validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
          } | null;
        }>;
      };
    } | null>;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: any | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: any | null;
    };
  } | null;
};

export type ValidatorSessionsQueryVariables = Exact<{
  keyGen?: InputMaybe<Scalars['Boolean']>;
  validatorId: Scalars['String'];
  perPage: Scalars['Int'];
  offset: Scalars['Int'];
}>;

export type ValidatorSessionsQuery = {
  __typename?: 'Query';
  sessionValidators?: {
    __typename?: 'SessionValidatorsConnection';
    totalCount: number;
    nodes: Array<{
      __typename?: 'SessionValidator';
      validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
      session?: {
        __typename?: 'Session';
        id: string;
        publicKey?: {
          __typename?: 'PublicKey';
          id: string;
          compressed?: string | null;
          uncompressed?: string | null;
        } | null;
        sessionValidators: {
          __typename?: 'SessionValidatorsConnection';
          totalCount: number;
          edges: Array<{
            __typename?: 'SessionValidatorsEdge';
            node?: {
              __typename?: 'SessionValidator';
              id: string;
              sessionId: string;
              reputation: string;
              isBest: boolean;
              isNext: boolean;
              isNextBest: boolean;
              bestOrder: number;
              nextBestOrder: number;
              validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
            } | null;
          }>;
        };
      } | null;
    } | null>;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: any | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: any | null;
    };
  } | null;
};

export type ValidatorOfSessionQueryVariables = Exact<{
  validatorId: Scalars['String'];
  sessionValidatorId: Scalars['String'];
}>;

export type ValidatorOfSessionQuery = {
  __typename?: 'Query';
  sessionValidator?: {
    __typename?: 'SessionValidator';
    id: string;
    sessionId: string;
    reputation: string;
    isBest: boolean;
    isNext: boolean;
    isNextBest: boolean;
    bestOrder: number;
    nextBestOrder: number;
    session?: { __typename?: 'Session'; keyGenThreshold?: any | null } | null;
    validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
  } | null;
  sessionValidators?: {
    __typename?: 'SessionValidatorsConnection';
    aggregates?: {
      __typename?: 'SessionValidatorAggregates';
      distinctCount?: { __typename?: 'SessionValidatorDistinctCountAggregates'; id?: any | null } | null;
    } | null;
  } | null;
};

export type ValidatorMetaFragment = { __typename?: 'Validator'; authorityId: string; id: string };

export type PageInfoMetaFragment = {
  __typename?: 'PageInfo';
  endCursor?: any | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: any | null;
};

export type SessionAuthValidatorNodeFragment = {
  __typename?: 'SessionValidator';
  id: string;
  sessionId: string;
  reputation: string;
  isBest: boolean;
  isNext: boolean;
  isNextBest: boolean;
  bestOrder: number;
  nextBestOrder: number;
  validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
};

export type SessionAuthValidatorFragment = {
  __typename?: 'SessionValidatorsConnection';
  edges: Array<{
    __typename?: 'SessionValidatorsEdge';
    node?: {
      __typename?: 'SessionValidator';
      id: string;
      sessionId: string;
      reputation: string;
      isBest: boolean;
      isNext: boolean;
      isNextBest: boolean;
      bestOrder: number;
      nextBestOrder: number;
      validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
    } | null;
  }>;
};

export type SessionAuthFragment = {
  __typename?: 'Session';
  sessionValidators: {
    __typename?: 'SessionValidatorsConnection';
    edges: Array<{
      __typename?: 'SessionValidatorsEdge';
      node?: {
        __typename?: 'SessionValidator';
        id: string;
        sessionId: string;
        reputation: string;
        isBest: boolean;
        isNext: boolean;
        isNextBest: boolean;
        bestOrder: number;
        nextBestOrder: number;
        validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
      } | null;
    }>;
  };
};

export type MetaDataQueryVariables = Exact<{ [key: string]: never }>;

export type MetaDataQuery = {
  __typename?: 'Query';
  _metadata?: { __typename?: '_Metadata'; targetHeight?: number | null; lastProcessedHeight?: number | null } | null;
};

export type ProposalCounterQueryVariables = Exact<{ [key: string]: never }>;

export type ProposalCounterQuery = {
  __typename?: 'Query';
  proposalCounters?: {
    __typename?: 'ProposalCountersConnection';
    nodes: Array<{
      __typename?: 'ProposalCounter';
      id: string;
      blockNumber: number;
      unSignedProposalsCount: number;
      signedProposalsCount: number;
      statusMap?: any | null;
      unSignedProposalsMap?: any | null;
      signedProposalsMap?: any | null;
    } | null>;
  } | null;
};

export type ProposalsQueryVariables = Exact<{
  PerPage: Scalars['Int'];
  Offset: Scalars['Int'];
}>;

export type ProposalsQuery = {
  __typename?: 'Query';
  proposalItems?: {
    __typename?: 'ProposalItemsConnection';
    nodes: Array<{
      __typename?: 'ProposalItem';
      id: string;
      data: string;
      signature?: string | null;
      type: ProposalType;
      status: string;
      votes: any;
      timelineStatus: any;
      currentStatus: any;
      block?: { __typename?: 'Block'; timestamp?: any | null; number: any } | null;
    } | null>;
  } | null;
};

export type ProposalsCounterQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type ProposalsCounterQuery = {
  __typename?: 'Query';
  proposalCounter?: {
    __typename?: 'ProposalCounter';
    id: string;
    signedProposalsMap?: any | null;
    unSignedProposalsMap?: any | null;
    signedProposalsCount: number;
    unSignedProposalsCount: number;
    statusMap?: any | null;
    block?: { __typename?: 'Block'; number: any; timestamp?: any | null } | null;
  } | null;
};

export type PublicKeysQueryVariables = Exact<{
  PerPage?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
}>;

export type PublicKeysQuery = {
  __typename?: 'Query';
  publicKeys?: {
    __typename?: 'PublicKeysConnection';
    totalCount: number;
    nodes: Array<{
      __typename?: 'PublicKey';
      id: string;
      compressed?: string | null;
      uncompressed?: string | null;
      history: any;
      block?: { __typename?: 'Block'; timestamp?: any | null; number: any } | null;
      sessions: {
        __typename?: 'SessionsConnection';
        nodes: Array<{
          __typename?: 'Session';
          id: string;
          keyGenThreshold?: any | null;
          signatureThreshold?: any | null;
          sessionValidators: {
            __typename?: 'SessionValidatorsConnection';
            edges: Array<{
              __typename?: 'SessionValidatorsEdge';
              node?: {
                __typename?: 'SessionValidator';
                id: string;
                sessionId: string;
                reputation: string;
                isBest: boolean;
                isNext: boolean;
                isNextBest: boolean;
                bestOrder: number;
                nextBestOrder: number;
                validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
              } | null;
            }>;
          };
        } | null>;
      };
    } | null>;
    pageInfo: {
      __typename?: 'PageInfo';
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: any | null;
      endCursor?: any | null;
    };
  } | null;
};

export type PublicKeyQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type PublicKeyQuery = {
  __typename?: 'Query';
  publicKey?: {
    __typename?: 'PublicKey';
    id: string;
    compressed?: string | null;
    uncompressed?: string | null;
    history: any;
    block?: { __typename?: 'Block'; timestamp?: any | null; number: any } | null;
    sessions: {
      __typename?: 'SessionsConnection';
      nodes: Array<{
        __typename?: 'Session';
        id: string;
        keyGenThreshold?: any | null;
        signatureThreshold?: any | null;
        sessionValidators: {
          __typename?: 'SessionValidatorsConnection';
          edges: Array<{
            __typename?: 'SessionValidatorsEdge';
            node?: {
              __typename?: 'SessionValidator';
              id: string;
              sessionId: string;
              reputation: string;
              isBest: boolean;
              isNext: boolean;
              isNextBest: boolean;
              bestOrder: number;
              nextBestOrder: number;
              validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
            } | null;
          }>;
        };
      } | null>;
    };
  } | null;
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
      signatureThreshold?: any | null;
      keyGenThreshold?: any | null;
      proposerThreshold?: any | null;
      publicKey?: { __typename?: 'PublicKey'; compressed?: string | null } | null;
      block?: { __typename?: 'Block'; id: string; timestamp?: any | null } | null;
      sessionValidators: {
        __typename?: 'SessionValidatorsConnection';
        edges: Array<{
          __typename?: 'SessionValidatorsEdge';
          node?: {
            __typename?: 'SessionValidator';
            id: string;
            sessionId: string;
            reputation: string;
            isBest: boolean;
            isNext: boolean;
            isNextBest: boolean;
            bestOrder: number;
            nextBestOrder: number;
            validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
          } | null;
        }>;
      };
    } | null>;
  } | null;
};

export type SessionKeysQueryVariables = Exact<{
  SessionId: Array<Scalars['String']> | Scalars['String'];
}>;

export type SessionKeysQuery = {
  __typename?: 'Query';
  sessions?: {
    __typename?: 'SessionsConnection';
    nodes: Array<{
      __typename?: 'Session';
      id: string;
      publicKey?: {
        __typename?: 'PublicKey';
        id: string;
        compressed?: string | null;
        uncompressed?: string | null;
        block?: { __typename?: 'Block'; timestamp?: any | null; number: any } | null;
      } | null;
      sessionValidators: {
        __typename?: 'SessionValidatorsConnection';
        edges: Array<{
          __typename?: 'SessionValidatorsEdge';
          node?: {
            __typename?: 'SessionValidator';
            id: string;
            sessionId: string;
            reputation: string;
            isBest: boolean;
            isNext: boolean;
            isNextBest: boolean;
            bestOrder: number;
            nextBestOrder: number;
            validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
          } | null;
        }>;
      };
    } | null>;
  } | null;
};

export type SessionThresholdHistoryQueryVariables = Exact<{
  offset: Scalars['Int'];
  perPage: Scalars['Int'];
}>;

export type SessionThresholdHistoryQuery = {
  __typename?: 'Query';
  sessions?: {
    __typename?: 'SessionsConnection';
    totalCount: number;
    nodes: Array<{
      __typename?: 'Session';
      id: string;
      signatureThreshold?: any | null;
      keyGenThreshold?: any | null;
      block?: { __typename?: 'Block'; id: string; timestamp?: any | null } | null;
    } | null>;
    pageInfo: {
      __typename?: 'PageInfo';
      endCursor?: any | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: any | null;
    };
  } | null;
};

export type SessionThresholdsQueryVariables = Exact<{
  sessionId: Scalars['String'];
}>;

export type SessionThresholdsQuery = {
  __typename?: 'Query';
  session?: {
    __typename?: 'Session';
    id: string;
    signatureThreshold?: any | null;
    keyGenThreshold?: any | null;
    proposersCount?: number | null;
    publicKey?: {
      __typename?: 'PublicKey';
      id: string;
      compressed?: string | null;
      uncompressed?: string | null;
      block?: { __typename?: 'Block'; timestamp?: any | null; number: any } | null;
    } | null;
    sessionValidators: {
      __typename?: 'SessionValidatorsConnection';
      edges: Array<{
        __typename?: 'SessionValidatorsEdge';
        node?: {
          __typename?: 'SessionValidator';
          id: string;
          sessionId: string;
          reputation: string;
          isBest: boolean;
          isNext: boolean;
          isNextBest: boolean;
          bestOrder: number;
          nextBestOrder: number;
          validator?: { __typename?: 'Validator'; authorityId: string; id: string } | null;
        } | null;
      }>;
    };
  } | null;
};

export const PageInfoMetaFragmentDoc = gql`
  fragment PageInfoMeta on PageInfo {
    endCursor
    hasNextPage
    hasPreviousPage
    startCursor
  }
`;
export const ValidatorMetaFragmentDoc = gql`
  fragment ValidatorMeta on Validator {
    authorityId
    id
  }
`;
export const SessionAuthValidatorNodeFragmentDoc = gql`
  fragment SessionAuthValidatorNode on SessionValidator {
    id
    sessionId
    validator {
      ...ValidatorMeta
    }
    reputation
    isBest
    isNext
    isNextBest
    bestOrder
    nextBestOrder
  }
  ${ValidatorMetaFragmentDoc}
`;
export const SessionAuthValidatorFragmentDoc = gql`
  fragment SessionAuthValidator on SessionValidatorsConnection {
    edges {
      node {
        ...SessionAuthValidatorNode
      }
    }
  }
  ${SessionAuthValidatorNodeFragmentDoc}
`;
export const SessionAuthFragmentDoc = gql`
  fragment SessionAuth on Session {
    sessionValidators {
      ...SessionAuthValidator
    }
  }
  ${SessionAuthValidatorFragmentDoc}
`;
export const ValidatorListingDocument = gql`
  query ValidatorListing($sessionId: String!, $perPage: Int!, $offset: Int!) {
    validators(offset: $offset, first: $perPage) {
      nodes {
        ...ValidatorMeta
        sessionValidators(first: 1, filter: { sessionId: { equalTo: $sessionId } }) {
          ...SessionAuthValidator
        }
      }
      totalCount
      pageInfo {
        ...PageInfoMeta
      }
    }
  }
  ${ValidatorMetaFragmentDoc}
  ${SessionAuthValidatorFragmentDoc}
  ${PageInfoMetaFragmentDoc}
`;

/**
 * __useValidatorListingQuery__
 *
 * To run a query within a React component, call `useValidatorListingQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidatorListingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidatorListingQuery({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *      perPage: // value for 'perPage'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useValidatorListingQuery(
  baseOptions: Apollo.QueryHookOptions<ValidatorListingQuery, ValidatorListingQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ValidatorListingQuery, ValidatorListingQueryVariables>(ValidatorListingDocument, options);
}
export function useValidatorListingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ValidatorListingQuery, ValidatorListingQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ValidatorListingQuery, ValidatorListingQueryVariables>(ValidatorListingDocument, options);
}
export type ValidatorListingQueryHookResult = ReturnType<typeof useValidatorListingQuery>;
export type ValidatorListingLazyQueryHookResult = ReturnType<typeof useValidatorListingLazyQuery>;
export type ValidatorListingQueryResult = Apollo.QueryResult<ValidatorListingQuery, ValidatorListingQueryVariables>;
export const ValidatorSessionsDocument = gql`
  query ValidatorSessions($keyGen: Boolean, $validatorId: String!, $perPage: Int!, $offset: Int!) {
    sessionValidators(
      filter: { isBest: { equalTo: $keyGen }, validatorId: { equalTo: $validatorId } }
      offset: $offset
      first: $perPage
    ) {
      nodes {
        validator {
          ...ValidatorMeta
        }
        session {
          id
          publicKey {
            id
            compressed
            uncompressed
          }
          sessionValidators(first: 3) {
            ...SessionAuthValidator
            totalCount
          }
        }
      }
      totalCount
      pageInfo {
        ...PageInfoMeta
      }
    }
  }
  ${ValidatorMetaFragmentDoc}
  ${SessionAuthValidatorFragmentDoc}
  ${PageInfoMetaFragmentDoc}
`;

/**
 * __useValidatorSessionsQuery__
 *
 * To run a query within a React component, call `useValidatorSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidatorSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidatorSessionsQuery({
 *   variables: {
 *      keyGen: // value for 'keyGen'
 *      validatorId: // value for 'validatorId'
 *      perPage: // value for 'perPage'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useValidatorSessionsQuery(
  baseOptions: Apollo.QueryHookOptions<ValidatorSessionsQuery, ValidatorSessionsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ValidatorSessionsQuery, ValidatorSessionsQueryVariables>(ValidatorSessionsDocument, options);
}
export function useValidatorSessionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ValidatorSessionsQuery, ValidatorSessionsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ValidatorSessionsQuery, ValidatorSessionsQueryVariables>(
    ValidatorSessionsDocument,
    options
  );
}
export type ValidatorSessionsQueryHookResult = ReturnType<typeof useValidatorSessionsQuery>;
export type ValidatorSessionsLazyQueryHookResult = ReturnType<typeof useValidatorSessionsLazyQuery>;
export type ValidatorSessionsQueryResult = Apollo.QueryResult<ValidatorSessionsQuery, ValidatorSessionsQueryVariables>;
export const ValidatorOfSessionDocument = gql`
  query ValidatorOfSession($validatorId: String!, $sessionValidatorId: String!) {
    sessionValidator(id: $sessionValidatorId) {
      ...SessionAuthValidatorNode
      session {
        keyGenThreshold
      }
    }
    sessionValidators(filter: { validatorId: { equalTo: $validatorId }, isBest: { equalTo: true } }) {
      aggregates {
        distinctCount {
          id
        }
      }
    }
  }
  ${SessionAuthValidatorNodeFragmentDoc}
`;

/**
 * __useValidatorOfSessionQuery__
 *
 * To run a query within a React component, call `useValidatorOfSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidatorOfSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidatorOfSessionQuery({
 *   variables: {
 *      validatorId: // value for 'validatorId'
 *      sessionValidatorId: // value for 'sessionValidatorId'
 *   },
 * });
 */
export function useValidatorOfSessionQuery(
  baseOptions: Apollo.QueryHookOptions<ValidatorOfSessionQuery, ValidatorOfSessionQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ValidatorOfSessionQuery, ValidatorOfSessionQueryVariables>(
    ValidatorOfSessionDocument,
    options
  );
}
export function useValidatorOfSessionLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ValidatorOfSessionQuery, ValidatorOfSessionQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ValidatorOfSessionQuery, ValidatorOfSessionQueryVariables>(
    ValidatorOfSessionDocument,
    options
  );
}
export type ValidatorOfSessionQueryHookResult = ReturnType<typeof useValidatorOfSessionQuery>;
export type ValidatorOfSessionLazyQueryHookResult = ReturnType<typeof useValidatorOfSessionLazyQuery>;
export type ValidatorOfSessionQueryResult = Apollo.QueryResult<
  ValidatorOfSessionQuery,
  ValidatorOfSessionQueryVariables
>;
export const MetaDataDocument = gql`
  query MetaData {
    _metadata {
      targetHeight
      lastProcessedHeight
    }
  }
`;

/**
 * __useMetaDataQuery__
 *
 * To run a query within a React component, call `useMetaDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useMetaDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMetaDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useMetaDataQuery(baseOptions?: Apollo.QueryHookOptions<MetaDataQuery, MetaDataQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MetaDataQuery, MetaDataQueryVariables>(MetaDataDocument, options);
}
export function useMetaDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MetaDataQuery, MetaDataQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MetaDataQuery, MetaDataQueryVariables>(MetaDataDocument, options);
}
export type MetaDataQueryHookResult = ReturnType<typeof useMetaDataQuery>;
export type MetaDataLazyQueryHookResult = ReturnType<typeof useMetaDataLazyQuery>;
export type MetaDataQueryResult = Apollo.QueryResult<MetaDataQuery, MetaDataQueryVariables>;
export const ProposalCounterDocument = gql`
  query ProposalCounter {
    proposalCounters(first: 2, offset: 1, orderBy: [BLOCK_NUMBER_DESC]) {
      nodes {
        id
        blockNumber
        unSignedProposalsCount
        signedProposalsCount
        statusMap
        unSignedProposalsMap
        signedProposalsMap
      }
    }
  }
`;

/**
 * __useProposalCounterQuery__
 *
 * To run a query within a React component, call `useProposalCounterQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalCounterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalCounterQuery({
 *   variables: {
 *   },
 * });
 */
export function useProposalCounterQuery(
  baseOptions?: Apollo.QueryHookOptions<ProposalCounterQuery, ProposalCounterQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ProposalCounterQuery, ProposalCounterQueryVariables>(ProposalCounterDocument, options);
}
export function useProposalCounterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ProposalCounterQuery, ProposalCounterQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ProposalCounterQuery, ProposalCounterQueryVariables>(ProposalCounterDocument, options);
}
export type ProposalCounterQueryHookResult = ReturnType<typeof useProposalCounterQuery>;
export type ProposalCounterLazyQueryHookResult = ReturnType<typeof useProposalCounterLazyQuery>;
export type ProposalCounterQueryResult = Apollo.QueryResult<ProposalCounterQuery, ProposalCounterQueryVariables>;
export const ProposalsDocument = gql`
  query Proposals($PerPage: Int!, $Offset: Int!) {
    proposalItems(first: $PerPage, offset: $Offset) {
      nodes {
        id
        data
        signature
        type
        status
        votes
        timelineStatus
        currentStatus
        block {
          timestamp
          number
        }
      }
    }
  }
`;

/**
 * __useProposalsQuery__
 *
 * To run a query within a React component, call `useProposalsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsQuery({
 *   variables: {
 *      PerPage: // value for 'PerPage'
 *      Offset: // value for 'Offset'
 *   },
 * });
 */
export function useProposalsQuery(baseOptions: Apollo.QueryHookOptions<ProposalsQuery, ProposalsQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
}
export function useProposalsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ProposalsQuery, ProposalsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ProposalsQuery, ProposalsQueryVariables>(ProposalsDocument, options);
}
export type ProposalsQueryHookResult = ReturnType<typeof useProposalsQuery>;
export type ProposalsLazyQueryHookResult = ReturnType<typeof useProposalsLazyQuery>;
export type ProposalsQueryResult = Apollo.QueryResult<ProposalsQuery, ProposalsQueryVariables>;
export const ProposalsCounterDocument = gql`
  query ProposalsCounter($id: String!) {
    proposalCounter(id: $id) {
      id
      signedProposalsMap
      unSignedProposalsMap
      signedProposalsCount
      unSignedProposalsCount
      statusMap
      block {
        number
        timestamp
      }
    }
  }
`;

/**
 * __useProposalsCounterQuery__
 *
 * To run a query within a React component, call `useProposalsCounterQuery` and pass it any options that fit your needs.
 * When your component renders, `useProposalsCounterQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProposalsCounterQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProposalsCounterQuery(
  baseOptions: Apollo.QueryHookOptions<ProposalsCounterQuery, ProposalsCounterQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ProposalsCounterQuery, ProposalsCounterQueryVariables>(ProposalsCounterDocument, options);
}
export function useProposalsCounterLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ProposalsCounterQuery, ProposalsCounterQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ProposalsCounterQuery, ProposalsCounterQueryVariables>(ProposalsCounterDocument, options);
}
export type ProposalsCounterQueryHookResult = ReturnType<typeof useProposalsCounterQuery>;
export type ProposalsCounterLazyQueryHookResult = ReturnType<typeof useProposalsCounterLazyQuery>;
export type ProposalsCounterQueryResult = Apollo.QueryResult<ProposalsCounterQuery, ProposalsCounterQueryVariables>;
export const PublicKeysDocument = gql`
  query PublicKeys($PerPage: Int, $offset: Int) {
    publicKeys(first: $PerPage, offset: $offset, orderBy: [SESSIONS_SUM_BLOCK_NUMBER_ASC]) {
      nodes {
        id
        compressed
        uncompressed
        history
        block {
          timestamp
          number
        }
        sessions(first: 1) {
          nodes {
            id
            ...SessionAuth
            keyGenThreshold
            signatureThreshold
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
  ${SessionAuthFragmentDoc}
`;

/**
 * __usePublicKeysQuery__
 *
 * To run a query within a React component, call `usePublicKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublicKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublicKeysQuery({
 *   variables: {
 *      PerPage: // value for 'PerPage'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function usePublicKeysQuery(baseOptions?: Apollo.QueryHookOptions<PublicKeysQuery, PublicKeysQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PublicKeysQuery, PublicKeysQueryVariables>(PublicKeysDocument, options);
}
export function usePublicKeysLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<PublicKeysQuery, PublicKeysQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PublicKeysQuery, PublicKeysQueryVariables>(PublicKeysDocument, options);
}
export type PublicKeysQueryHookResult = ReturnType<typeof usePublicKeysQuery>;
export type PublicKeysLazyQueryHookResult = ReturnType<typeof usePublicKeysLazyQuery>;
export type PublicKeysQueryResult = Apollo.QueryResult<PublicKeysQuery, PublicKeysQueryVariables>;
export const PublicKeyDocument = gql`
  query PublicKey($id: String!) {
    publicKey(id: $id) {
      id
      compressed
      uncompressed
      history
      block {
        timestamp
        number
      }
      sessions(first: 1) {
        nodes {
          id
          ...SessionAuth
          keyGenThreshold
          signatureThreshold
        }
      }
    }
  }
  ${SessionAuthFragmentDoc}
`;

/**
 * __usePublicKeyQuery__
 *
 * To run a query within a React component, call `usePublicKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `usePublicKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePublicKeyQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePublicKeyQuery(baseOptions: Apollo.QueryHookOptions<PublicKeyQuery, PublicKeyQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<PublicKeyQuery, PublicKeyQueryVariables>(PublicKeyDocument, options);
}
export function usePublicKeyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<PublicKeyQuery, PublicKeyQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<PublicKeyQuery, PublicKeyQueryVariables>(PublicKeyDocument, options);
}
export type PublicKeyQueryHookResult = ReturnType<typeof usePublicKeyQuery>;
export type PublicKeyLazyQueryHookResult = ReturnType<typeof usePublicKeyLazyQuery>;
export type PublicKeyQueryResult = Apollo.QueryResult<PublicKeyQuery, PublicKeyQueryVariables>;
export const CurrentSessionAuthoritiesDocument = gql`
  query CurrentSessionAuthorities {
    sessions(last: 1, orderBy: [BLOCK_NUMBER_DESC]) {
      nodes {
        id
        blockId
        ...SessionAuth
        publicKey {
          compressed
        }
        signatureThreshold
        keyGenThreshold
        proposerThreshold
        block {
          id
          timestamp
        }
      }
    }
  }
  ${SessionAuthFragmentDoc}
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
export const SessionKeysDocument = gql`
  query SessionKeys($SessionId: [String!]!) {
    sessions(filter: { id: { in: $SessionId } }) {
      nodes {
        id
        ...SessionAuth
        publicKey {
          id
          compressed
          uncompressed
          block {
            timestamp
            number
          }
        }
      }
    }
  }
  ${SessionAuthFragmentDoc}
`;

/**
 * __useSessionKeysQuery__
 *
 * To run a query within a React component, call `useSessionKeysQuery` and pass it any options that fit your needs.
 * When your component renders, `useSessionKeysQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSessionKeysQuery({
 *   variables: {
 *      SessionId: // value for 'SessionId'
 *   },
 * });
 */
export function useSessionKeysQuery(baseOptions: Apollo.QueryHookOptions<SessionKeysQuery, SessionKeysQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SessionKeysQuery, SessionKeysQueryVariables>(SessionKeysDocument, options);
}
export function useSessionKeysLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SessionKeysQuery, SessionKeysQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SessionKeysQuery, SessionKeysQueryVariables>(SessionKeysDocument, options);
}
export type SessionKeysQueryHookResult = ReturnType<typeof useSessionKeysQuery>;
export type SessionKeysLazyQueryHookResult = ReturnType<typeof useSessionKeysLazyQuery>;
export type SessionKeysQueryResult = Apollo.QueryResult<SessionKeysQuery, SessionKeysQueryVariables>;
export const SessionThresholdHistoryDocument = gql`
  query SessionThresholdHistory($offset: Int!, $perPage: Int!) {
    sessions(first: $perPage, offset: $offset, orderBy: [BLOCK_NUMBER_DESC]) {
      nodes {
        id
        signatureThreshold
        keyGenThreshold
        block {
          id
          timestamp
        }
      }
      pageInfo {
        ...PageInfoMeta
      }
      totalCount
    }
  }
  ${PageInfoMetaFragmentDoc}
`;

/**
 * __useSessionThresholdHistoryQuery__
 *
 * To run a query within a React component, call `useSessionThresholdHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useSessionThresholdHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSessionThresholdHistoryQuery({
 *   variables: {
 *      offset: // value for 'offset'
 *      perPage: // value for 'perPage'
 *   },
 * });
 */
export function useSessionThresholdHistoryQuery(
  baseOptions: Apollo.QueryHookOptions<SessionThresholdHistoryQuery, SessionThresholdHistoryQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SessionThresholdHistoryQuery, SessionThresholdHistoryQueryVariables>(
    SessionThresholdHistoryDocument,
    options
  );
}
export function useSessionThresholdHistoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SessionThresholdHistoryQuery, SessionThresholdHistoryQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SessionThresholdHistoryQuery, SessionThresholdHistoryQueryVariables>(
    SessionThresholdHistoryDocument,
    options
  );
}
export type SessionThresholdHistoryQueryHookResult = ReturnType<typeof useSessionThresholdHistoryQuery>;
export type SessionThresholdHistoryLazyQueryHookResult = ReturnType<typeof useSessionThresholdHistoryLazyQuery>;
export type SessionThresholdHistoryQueryResult = Apollo.QueryResult<
  SessionThresholdHistoryQuery,
  SessionThresholdHistoryQueryVariables
>;
export const SessionThresholdsDocument = gql`
  query SessionThresholds($sessionId: String!) {
    session(id: $sessionId) {
      id
      signatureThreshold
      keyGenThreshold
      proposersCount
      ...SessionAuth
      publicKey {
        id
        compressed
        uncompressed
        block {
          timestamp
          number
        }
      }
    }
  }
  ${SessionAuthFragmentDoc}
`;

/**
 * __useSessionThresholdsQuery__
 *
 * To run a query within a React component, call `useSessionThresholdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSessionThresholdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSessionThresholdsQuery({
 *   variables: {
 *      sessionId: // value for 'sessionId'
 *   },
 * });
 */
export function useSessionThresholdsQuery(
  baseOptions: Apollo.QueryHookOptions<SessionThresholdsQuery, SessionThresholdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SessionThresholdsQuery, SessionThresholdsQueryVariables>(SessionThresholdsDocument, options);
}
export function useSessionThresholdsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SessionThresholdsQuery, SessionThresholdsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SessionThresholdsQuery, SessionThresholdsQueryVariables>(
    SessionThresholdsDocument,
    options
  );
}
export type SessionThresholdsQueryHookResult = ReturnType<typeof useSessionThresholdsQuery>;
export type SessionThresholdsLazyQueryHookResult = ReturnType<typeof useSessionThresholdsLazyQuery>;
export type SessionThresholdsQueryResult = Apollo.QueryResult<SessionThresholdsQuery, SessionThresholdsQueryVariables>;
