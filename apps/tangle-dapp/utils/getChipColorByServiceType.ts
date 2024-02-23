import type { ChipColors } from '@webb-tools/webb-ui-components';

import { ServiceType } from '../types';

// TODO: update this to match the actual service types
export default function getChipColorByServiceType(
  serviceType: ServiceType
): ChipColors {
  switch (serviceType) {
    case ServiceType.ZK_SAAS_GROTH16:
    case ServiceType.ZK_SAAS_MARLIN:
      return 'blue';
    case ServiceType.DKG_TSS_CGGMP:
      return 'purple';
    case ServiceType.TX_RELAY:
      return 'green';
  }
}
