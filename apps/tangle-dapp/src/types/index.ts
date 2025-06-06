import type {
  SpStakingExposurePage,
  SpStakingPagedExposureMetadata,
} from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';

export enum PagePath {
  DASHBOARD = '/',
  NOMINATION = '/nomination',
  NOMINATION_VALIDATOR = '/nomination/:validatorAddress',
  CLAIM_AIRDROP = '/claim',
  CLAIM_AIRDROP_SUCCESS = '/claim/success',
  BRIDGE = '/bridge',
  BLUEPRINTS = '/blueprints',
  BLUEPRINTS_DETAILS = '/blueprints/:id',
  SERVICES = '/services',
  RESTAKE = '/restake',
  RESTAKE_DEPOSIT = '/restake/deposit',
  RESTAKE_DELEGATE = '/restake/delegate',
  RESTAKE_UNDELEGATE = '/restake/undelegate',
  RESTAKE_WITHDRAW = '/restake/withdraw',
  RESTAKE_VAULT = '/restake/vaults',
  RESTAKE_BLUEPRINT = '/restake/blueprints',
  RESTAKE_OPERATOR = '/restake/operators',
  LIQUID_STAKING = '/liquid-staking',
  NOT_FOUND = '/404',
}

export enum QueryParamKey {
  DELEGATIONS_AND_PAYOUTS_TAB = 'tab',
  RESTAKE_VAULT = 'vault',
  RESTAKE_ASSET_ID = 'assetId',
  RESTAKE_OPERATOR = 'operator',
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
  STAKED = 'Staked (increase stake)',
  STASH = 'Stash (do not increase stake)',
  CONTROLLER = 'Controller Account',
  ACCOUNT = 'Specific Account',
  NONE = 'None',
}

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
  LsPools,
}

export type ExposureMap = Record<
  string,
  {
    exposure: SpStakingExposurePage;
    exposureMeta: SpStakingPagedExposureMetadata;
  }
>;

export type GetSuccessMessageFn<Context> = (context: Context) => string;

/**
 * Transaction states for payout processing
 */
export enum PayoutTxState {
  /**
   * Transaction is not active
   */
  IDLE = 'idle',
  /**
   * Transaction is being executed
   */
  PROCESSING = 'processing',
  /**
   * Waiting for confirmation
   */
  WAITING = 'waiting',
  /**
   * Current chunk succeeded
   */
  SUCCESS = 'success',
  /**
   * Transaction error
   */
  ERROR = 'error',
  /**
   * All chunks completed
   */
  COMPLETED = 'completed',
}
