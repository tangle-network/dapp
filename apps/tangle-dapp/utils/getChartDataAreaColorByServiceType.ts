import { ChartColor } from '../constants';
import { ServiceType } from '../types';

// TODO: Update this to match the actual service types.
export default function getChartDataAreaColorByServiceType(
  serviceType: ServiceType
): ChartColor {
  switch (serviceType) {
    case ServiceType.ZK_SAAS_GROTH16:
      return ChartColor.GREEN;
    case ServiceType.ZK_SAAS_MARLIN:
      return ChartColor.BLUE;
    case ServiceType.LIGHT_CLIENT_RELAYING:
      return ChartColor.LAVENDER;
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
      return ChartColor.YELLOW;
  }
}
