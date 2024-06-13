// Note that this import is necessary to fix a strange type error
// in Polkadot API's `api.tx.staking.bond` method, which complains
// about requiring three arguments instead of two.
import '@webb-tools/tangle-substrate-types';

import type {
  SpStakingExposurePage,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { WebbProviderType } from '@webb-tools/abstract-api-provider/types';

export enum PagePath {
  NOMINATION = '/nomination',
  CLAIM_AIRDROP = '/claim',
  ACCOUNT = '/',
  BRIDGE = '/bridge',
  SERVICES_OVERVIEW = '/services',
  SERVICES_RESTAKE = '/restake',
  LIQUID_RESTAKING = '/liquid-staking',
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

export type BasicAccountInfo = {
  address: string;
  identityName: string;
};

export interface Nominee extends BasicAccountInfo {
  isActive: boolean;
  commission: BN;
  selfStakeAmount: BN;
  totalStakeAmount: BN;
  nominatorCount: number;
}

export interface Validator extends Nominee {}

export type NodeSpecification = {
  os: string;
  version: string;
  cpuCores: number;
  memory: number;
  isVirtualMachine: boolean;
  linuxDistribution: string;
  linuxKernel: string;
};

// TODO: As of now, the other reward destinations are disabled in Tangle. Confirm whether they'll be used in the future, otherwise adjust this accordingly.
export enum StakingRewardsDestination {
  STAKED,
  STASH,
  CONTROLLER,
  ACCOUNT,
  NONE,
}

export enum StakingRewardsDestinationDisplayText {
  STAKED = 'Staked (increase the amount at stake)',
  STASH = 'Stash (do not increase the amount at stake)',
  CONTROLLER = 'Controller Account',
  ACCOUNT = 'Specific Account',
  NONE = 'None',
}

export type AddressWithIdentity = {
  address: string;
  identity: string;
};

export type Payout = {
  era: number;
  validator: AddressWithIdentity;
  validatorTotalStake: BN;
  nominators: AddressWithIdentity[];
  validatorTotalReward: BN;
  nominatorTotalReward: BN;
  nominatorTotalRewardRaw: BN;
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
  Value extends QueryParamValueOf<Key>,
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
  ZK_SAAS_GROTH16 = 'ZkSaaS_Groth16',
  ZK_SAAS_MARLIN = 'ZkSaaS_Marlin',
  LIGHT_CLIENT_RELAYING = 'Light Client Relaying',
  TSS_SILENT_SHARD_DKLS23SECP256K1 = 'TSS_SilentShardDKLS23Secp256k1',
  TSS_DFNS_CGGMP21SECP256K1 = 'TSS_DfnsCGGMP21Secp256k1',
  TSS_DFNS_CGGMP21SECP256R1 = 'TSS_DfnsCGGMP21Secp256r1',
  TSS_DFNS_CGGMP21STARK = 'TSS_DfnsCGGMP21Stark',
  TSS_ZCASH_FROST_P256 = 'TSS_ZcashFrostP256',
  TSS_ZCASH_FROST_P384 = 'TSS_ZcashFrostP384',
  TSS_ZCASH_FROST_SECP256K1 = 'TSS_ZcashFrostSecp256k1',
  TSS_ZCASH_FROST_RISTRETTO255 = 'TSS_ZcashFrostRistretto255',
  TSS_ZCASH_FROST_ED25519 = 'TSS_ZcashFrostEd25519',
  TSS_GENNARO_DKG_BLS381 = 'TSS_GennaroDKGBls381',
  TSS_ZCASH_FROST_ED448 = 'TSS_ZcashFrostEd448',
  TSS_WSTS_V2 = 'TSS_WSTS_V2',
}

export enum RestakingProfileType {
  INDEPENDENT = 'Independent',
  SHARED = 'Shared',
}

export type DistributionDataType = Record<RestakingService, BN>;

/**
 * There are phase 1 jobs in Substrate
 */
export type Service = {
  id: string;
  serviceType: RestakingService;
  participants: string[];
  threshold?: number;
  jobsCount?: number;
  earnings?: BN;
  expirationBlock: BN;
  ttlBlock: BN;
  permittedCaller?: string;
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
  identity?: string | null;
  twitter?: string | null;
  discord?: string | null;
  email?: string | null;
  web?: string | null;
};

export enum NetworkFeature {
  Faucet,
  EraStakersOverview,
}

export const ExplorerType = {
  Substrate: 'polkadot' as WebbProviderType,
  EVM: 'web3' as WebbProviderType,
} as const;

export type ExposureMap = Record<
  string,
  {
    exposure: SpStakingExposurePage;
    exposureMeta: SpStakingPagedExposureMetadata;
  }
>;

export type TokenSymbol = 'tTNT' | 'TNT';

/**
 * Represents a function type that takes a context parameter and returns a success message.
 * @param context The context parameter.
 * @returns The success message.
 */
export type GetSuccessMessageFunctionType<Context> = (
  context: Context,
) => string;
