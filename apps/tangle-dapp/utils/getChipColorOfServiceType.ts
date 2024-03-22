import type { ChipColors } from '@webb-tools/webb-ui-components';

import { RestakingService } from '../types';

// TODO: Update this to match the actual service types.
function getChipColorOfServiceType(serviceType: RestakingService): ChipColors {
  switch (serviceType) {
    case RestakingService.ZK_SAAS_GROTH16:
    case RestakingService.ZK_SAAS_MARLIN:
      return 'blue';
    case RestakingService.LIGHT_CLIENT_RELAYING:
      return 'green';
    case RestakingService.TSS_ZENGOGG20SECP256K1:
    case RestakingService.TSS_DFNS_CGGMP21SECP256K1:
    case RestakingService.TSS_DFNS_CGGMP21SECP256R1:
    case RestakingService.TSS_DFNS_CGGMP21STARK:
    case RestakingService.TSS_GENNARO_DKG_BLS381:
    case RestakingService.TSS_ZCASH_FROST_ED25519:
    case RestakingService.TSS_ZCASH_FROST_P256:
    case RestakingService.TSS_ZCASH_FROST_RISTRETTO255:
    case RestakingService.TSS_ZCASH_FROST_SECP256K1:
    case RestakingService.TSS_ZCASH_FROST_P384:
    case RestakingService.TSS_ZCASH_FROST_ED448:
      return 'purple';
  }
}

export default getChipColorOfServiceType;
