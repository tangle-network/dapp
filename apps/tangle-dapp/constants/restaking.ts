import {
  TanglePrimitivesRolesRoleType,
  TanglePrimitivesRolesTssThresholdSignatureRoleType,
  TanglePrimitivesRolesZksaasZeroKnowledgeRoleType,
} from '@polkadot/types/lookup';
import { RestakingService } from '../types';

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

export const TANGLE_TO_SERVICE_TYPE_ZK_SAAS_MAP: {
  [Key in TanglePrimitivesRolesZksaasZeroKnowledgeRoleType['type']]: RestakingService;
} = {
  ZkSaaSGroth16: RestakingService.ZK_SAAS_GROTH16,
  ZkSaaSMarlin: RestakingService.ZK_SAAS_MARLIN,
};
