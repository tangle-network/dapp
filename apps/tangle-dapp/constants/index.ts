import {
  TanglePrimitivesRolesRoleType,
  TanglePrimitivesRolesTssThresholdSignatureRoleType,
  TanglePrimitivesRolesZksaasZeroKnowledgeRoleType,
} from '@polkadot/types/lookup';

import { RestakingService } from '../types';

/**
 * The lock ids are always 8 characters long, due to their representation
 * as a `U8aFixed` in the Substrate runtime. That is why the enum values
 * are all 8 characters long, and may look a bit odd (e.g. `phrelect`, and
 * `vesting ` with a trailing space).
 */
export enum SubstrateLockId {
  VESTING = 'vesting ',
  STAKING = 'staking ',
  ELECTIONS_PHRAGMEN = 'phrelect',
  DEMOCRACY = 'democrac',

  // TODO: Need to account for the other lock types.
  OTHER = '?other',
}

/**
 * Stale-while-revalidate (SWR) is a strategy for caching fetch requests.
 *
 * It helps automatically avoid redundant requests if made again before
 * a specified period has elapsed. This can be particularly useful for
 * Polkadot API requests that return Promise objects.
 *
 * Since these requests don't always require real-time data and their
 * responses might not change frequently, caching them for a particular
 * duration can be efficient.
 *
 * [Learn more about SWR](https://swr.vercel.app/)
 */
export enum SwrBaseKey {
  ACTIVE_VALIDATORS = 'active-validators',
  WAITING_VALIDATORS = 'waiting-validators',
  ACTIVE_VALIDATORS_PAGINATED = 'active-validator-paginated',
}

export enum StaticAssetPath {
  RESTAKING_METHOD_INDEPENDENT_DARK = '/static/assets/restaking/method-independent-dark.svg',
  RESTAKING_METHOD_SHARED_DARK = '/static/assets/restaking/method-shared-dark.svg',
  RESTAKING_METHOD_INDEPENDENT_LIGHT = '/static/assets/restaking/method-independent-light.svg',
  RESTAKING_METHOD_SHARED_LIGHT = '/static/assets/restaking/method-shared-light.svg',
}

type TangleRoleMapping = {
  // By using `Extract`, the name is linked to the Substrate types,
  // so that if the name changes in the future, it will cause a static
  // type error here, and we can update the mapping accordingly.
  [key in RestakingService]:
    | Extract<TanglePrimitivesRolesRoleType['type'], 'LightClientRelaying'>
    | {
        Tss: TanglePrimitivesRolesTssThresholdSignatureRoleType['type'];
      }
    | {
        ZkSaaS: TanglePrimitivesRolesZksaasZeroKnowledgeRoleType['type'];
      };
};

export enum ChartColor {
  BLUE = '#B8D6FF',
  GREEN = '#85DC8E',
  GRAY = '#D3D8E2',
  DARK_GRAY = '#3A3E53',
  YELLOW = '#FFEAA6',
  LAVENDER = '#E7E2FF',
}

export const PAYMENT_DESTINATION_OPTIONS = [
  'Staked (increase the amount at stake)',
  'Stash (do not increase the amount at stake)',
];

// Note that the chain decimal count is usually constant, and set when
// the blockchain is deployed. It could be technically changed due to
// governance decisions and subsequent runtime upgrades, but that would
// be exceptionally rare, so it is best to assume that it remains constant
// here. Regardless, it can easily be changed here in the future if need be.
export const TANGLE_TOKEN_DECIMALS = 18;

/**
 * The values are based off [Tangle's `RoleType` enum](https://github.com/webb-tools/tangle/blob/2a60f0382db2a1234c490766381872d2c7243f5e/primitives/src/roles/mod.rs#L40).
 */
export const SERVICE_TYPE_TO_TANGLE_MAP = {
  [RestakingService.LIGHT_CLIENT_RELAYING]: 'LightClientRelaying',
  [RestakingService.ZK_SAAS_GROTH16]: { ZkSaaS: 'ZkSaaSGroth16' },
  [RestakingService.ZK_SAAS_MARLIN]: { ZkSaaS: 'ZkSaaSMarlin' },
  [RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1]: {
    Tss: 'SilentShardDKLS23Secp256k1',
  },
  [RestakingService.TSS_DFNS_CGGMP21SECP256K1]: { Tss: 'DfnsCGGMP21Secp256k1' },
  [RestakingService.TSS_DFNS_CGGMP21SECP256R1]: { Tss: 'DfnsCGGMP21Secp256r1' },
  [RestakingService.TSS_DFNS_CGGMP21STARK]: { Tss: 'DfnsCGGMP21Stark' },
  [RestakingService.TSS_ZCASH_FROST_P256]: { Tss: 'ZcashFrostP256' },
  [RestakingService.TSS_ZCASH_FROST_P384]: { Tss: 'ZcashFrostP384' },
  [RestakingService.TSS_ZCASH_FROST_SECP256K1]: { Tss: 'ZcashFrostSecp256k1' },
  [RestakingService.TSS_ZCASH_FROST_RISTRETTO255]: {
    Tss: 'ZcashFrostRistretto255',
  },
  [RestakingService.TSS_ZCASH_FROST_ED25519]: { Tss: 'ZcashFrostEd25519' },
  [RestakingService.TSS_GENNARO_DKG_BLS381]: { Tss: 'GennaroDKGBls381' },
  [RestakingService.TSS_ZCASH_FROST_ED448]: { Tss: 'ZcashFrostEd448' },
} as const satisfies TangleRoleMapping;

export const TANGLE_TO_SERVICE_TYPE_TSS_MAP: {
  [Key in TanglePrimitivesRolesTssThresholdSignatureRoleType['type']]: RestakingService;
} = {
  DfnsCGGMP21Secp256k1: RestakingService.TSS_DFNS_CGGMP21SECP256K1,
  DfnsCGGMP21Secp256r1: RestakingService.TSS_DFNS_CGGMP21SECP256R1,
  DfnsCGGMP21Stark: RestakingService.TSS_DFNS_CGGMP21STARK,
  GennaroDKGBls381: RestakingService.TSS_GENNARO_DKG_BLS381,
  SilentShardDKLS23Secp256k1: RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1,
  ZcashFrostEd25519: RestakingService.TSS_ZCASH_FROST_ED25519,
  ZcashFrostP256: RestakingService.TSS_ZCASH_FROST_P256,
  ZcashFrostP384: RestakingService.TSS_ZCASH_FROST_P384,
  ZcashFrostRistretto255: RestakingService.TSS_ZCASH_FROST_RISTRETTO255,
  ZcashFrostSecp256k1: RestakingService.TSS_ZCASH_FROST_SECP256K1,
  ZcashFrostEd448: RestakingService.TSS_ZCASH_FROST_ED448,
};
