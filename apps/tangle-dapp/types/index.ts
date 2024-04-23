// Note that this import is necessary to fix a strange type error
// in Polkadot API's `api.tx.staking.bond` method, which complains
// about requiring three arguments instead of two.
import '@webb-tools/tangle-substrate-types';

import { BN } from '@polkadot/util';

export enum PagePath {
  NOMINATION = '/nomination',
  CLAIM_AIRDROP = '/claim',
  ACCOUNT = '/',
  SERVICES_OVERVIEW = '/services',
  SERVICES_RESTAKE = '/restake',
}

export enum QueryParamKey {
  DELEGATIONS_AND_PAYOUTS_TAB = 'tab',
}

export type QueryParamKeyOf<Page extends PagePath> =
  Page extends PagePath.NOMINATION
    ? QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB
    : never;

export type QueryParamValueOf<Key extends QueryParamKey> =
  Key extends QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB
    ? DelegationsAndPayoutsTab
    : never;

export enum DelegationsAndPayoutsTab {
  NOMINATIONS = 'Nominations',
  PAYOUTS = 'Payouts',
}

export type Validator = {
  address: string;
  identityName: string;
  selfStaked: string;
  effectiveAmountStaked: string;
  effectiveAmountStakedRaw: string;
  delegations: string;
  commission: string;
  status: string;
};

export type Delegator = {
  address: string;
  identity: string;
  selfStaked: string;
  isActive: boolean;
  commission: string;
  delegations: string;
  effectiveAmountStaked: string;
};

export type NodeSpecification = {
  os: string;
  version: string;
  cpuCores: number;
  memory: number;
  isVirtualMachine: boolean;
  linuxDistribution: string;
  linuxKernel: string;
};

export enum PaymentDestination {
  STAKED = 'Staked (increase the amount at stake)',
  STASH = 'Stash (do not increase the amount at stake)',
  CONTROLLER = 'Controller Account',
}

export type AddressWithIdentity = {
  address: string;
  identity: string;
};

export type Payout = {
  era: number;
  validator: AddressWithIdentity;
  validatorTotalStake: string;
  nominators: AddressWithIdentity[];
  validatorTotalReward: string;
  nominatorTotalReward: string;
  status: 'claimed' | 'unclaimed';
};

/**
 * Utility type to remove trailing slash from a string.
 *
 * This is useful for constructing query param paths, as the
 * root path (`/`) should not have a trailing slash, but all
 * other paths should.
 */
type RemoveTrailingSlash<T extends string> = T extends `${infer U}/` ? U : T;

/**
 * Utility type to construct a query param path from a page path
 * and query param key/value in a strongly statically typed way.
 */
type SearchQueryPathOf<
  Page extends PagePath,
  Key extends QueryParamKeyOf<Page>,
  Value extends QueryParamValueOf<Key>
> = `${RemoveTrailingSlash<Page>}/?${Key}=${Value}`;

/**
 * Enum-like constant object containing the different paths
 * static search query key & value paths that can be linked to
 * directly.
 *
 * All paths are constructed using the {@link SearchQueryPathOf} utility
 * type, which ensures that the query param key and value are
 * statically typed and match the query param key and value types
 * for the given page.
 *
 * For example, `/account?tab=overview`.
 */
export const StaticSearchQueryPath: {
  NominationsTable: SearchQueryPathOf<
    PagePath.NOMINATION,
    QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB,
    DelegationsAndPayoutsTab.NOMINATIONS
  >;
  PayoutsTable: SearchQueryPathOf<
    PagePath.NOMINATION,
    QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB,
    DelegationsAndPayoutsTab.PAYOUTS
  >;
} = {
  NominationsTable: `${PagePath.NOMINATION}/?${QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB}=${DelegationsAndPayoutsTab.NOMINATIONS}`,
  PayoutsTable: `${PagePath.NOMINATION}/?${QueryParamKey.DELEGATIONS_AND_PAYOUTS_TAB}=${DelegationsAndPayoutsTab.PAYOUTS}`,
} as const;

export type InternalPath =
  | PagePath
  | (typeof StaticSearchQueryPath)[keyof typeof StaticSearchQueryPath];

/**
 * Also referred to as a `role` in Substrate.
 *
 * The values represent the user-facing UI display names
 * of the roles.
 */
export enum RestakingService {
  ZK_SAAS_GROTH16 = 'ZkSaaS (Groth16)',
  ZK_SAAS_MARLIN = 'ZkSaaS (Marlin)',
  LIGHT_CLIENT_RELAYING = 'Light Client Relaying',
  TSS_SILENT_SHARD_DKLS23SECP256K1 = 'TSS SilentShardDKLS23Secp256k1',
  TSS_DFNS_CGGMP21SECP256K1 = 'TSS DfnsCGGMP21Secp256k1',
  TSS_DFNS_CGGMP21SECP256R1 = 'TSS DfnsCGGMP21Secp256r1',
  TSS_DFNS_CGGMP21STARK = 'TSS DfnsCGGMP21Stark',
  TSS_ZCASH_FROST_P256 = 'TSS ZcashFrostP256',
  TSS_ZCASH_FROST_P384 = 'TSS ZcashFrostP384',
  TSS_ZCASH_FROST_SECP256K1 = 'TSS ZcashFrostSecp256k1',
  TSS_ZCASH_FROST_RISTRETTO255 = 'TSS ZcashFrostRistretto255',
  TSS_ZCASH_FROST_ED25519 = 'TSS ZcashFrostEd25519',
  TSS_GENNARO_DKG_BLS381 = 'TSS GennaroDKGBls381',
  TSS_ZCASH_FROST_ED448 = 'TSS ZcashFrostEd448',
}

export enum RestakingProfileType {
  INDEPENDENT = 'Independent',
  SHARED = 'Shared',
}

/**
 * There are phase 1 jobs in Substrate
 */
export type Service = {
  id: string;
  serviceType: RestakingService;
  participants: number;
  threshold?: number;
  jobsCount?: number;
  earnings?: BN;
  expirationBlock: string;
};

export type ServiceJob = {
  id: string;
  txHash: string;
  timestamp: Date;
};

export type JobType = {
  id?: number;
  serviceType: RestakingService;
  thresholds?: number;
  earnings?: number;
  expiration: number;
};

export type ServiceParticipant = {
  address: string;
  identity?: string;
  twitter?: string;
  discord?: string;
  email?: string;
  web?: string;
};

export enum NetworkFeature {
  Faucet,
}

export enum ExplorerType {
  Substrate = 'polkadot',
  EVM = 'web3',
}
