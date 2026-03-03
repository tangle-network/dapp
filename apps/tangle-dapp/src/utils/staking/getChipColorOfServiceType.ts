import type { ChipColors } from '@tangle-network/ui-components';

import { StakingService } from '../../types';

// Keep this switch aligned with `StakingService` whenever runtime service types expand.
function getChipColorOfServiceType(serviceType: StakingService): ChipColors {
  switch (serviceType) {
    case StakingService.ZK_SAAS_GROTH16:
    case StakingService.ZK_SAAS_MARLIN:
      return 'blue';
    case StakingService.LIGHT_CLIENT_RELAYING:
      return 'green';
    case StakingService.TSS_SILENT_SHARD_DKLS23SECP256K1:
    case StakingService.TSS_DFNS_CGGMP21SECP256K1:
    case StakingService.TSS_DFNS_CGGMP21SECP256R1:
    case StakingService.TSS_DFNS_CGGMP21STARK:
    case StakingService.TSS_GENNARO_DKG_BLS381:
    case StakingService.TSS_ZCASH_FROST_ED25519:
    case StakingService.TSS_ZCASH_FROST_P256:
    case StakingService.TSS_ZCASH_FROST_RISTRETTO255:
    case StakingService.TSS_ZCASH_FROST_SECP256K1:
    case StakingService.TSS_ZCASH_FROST_P384:
    case StakingService.TSS_ZCASH_FROST_ED448:
      return 'purple';
    default:
      return 'grey';
  }
}

export default getChipColorOfServiceType;
