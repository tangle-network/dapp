import { ChartColor } from '../constants';
import { RestakingService } from '../types';

// TODO: Update this to match the actual service types.
export default function getChartDataAreaColorByServiceType(
  serviceType: RestakingService
): ChartColor {
  switch (serviceType) {
    case RestakingService.ZK_SAAS_GROTH16:
      return ChartColor.GREEN;

    case RestakingService.ZK_SAAS_MARLIN:
      return ChartColor.BLUE;

    case RestakingService.LIGHT_CLIENT_RELAYING:
      return ChartColor.LAVENDER;

    case RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1:
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
      return ChartColor.YELLOW;

    default:
      return ChartColor.LAVENDER;
  }
}
