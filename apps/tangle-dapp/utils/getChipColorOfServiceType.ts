import type { ChipColors } from '@webb-tools/webb-ui-components';

import { ServiceType } from '../types';

// TODO: Update this to match the actual service types.
function getChipColorOfServiceType(serviceType: ServiceType): ChipColors {
  switch (serviceType) {
    case ServiceType.ZK_SAAS_GROTH16:
    case ServiceType.ZK_SAAS_MARLIN:
      return 'blue';
    case ServiceType.LIGHT_CLIENT_RELAYING:
      return 'green';
    case ServiceType.TSS_ZENGOGG20SECP256K1:
    case ServiceType.TSS_DFNS_CGGMP21SECP256K1:
    case ServiceType.TSS_DFNS_CGGMP21SECP256R1:
    case ServiceType.TSS_DFNS_CGGMP21STARK:
    case ServiceType.TSS_GENNARO_DKG_BLS381:
    case ServiceType.TSS_ZCASH_FROST_ED25519:
    case ServiceType.TSS_ZCASH_FROST_P256:
    case ServiceType.TSS_ZCASH_FROST_RISTRETTO255:
    case ServiceType.TSS_ZCASH_FROST_SECP256K1:
    case ServiceType.TSS_ZCASH_FROST_P384:
    case ServiceType.TSS_ZCASH_FROST_ED448:
      return 'purple';
  }
}

export default getChipColorOfServiceType;
