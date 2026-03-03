import { ChartColor } from '../../constants';
import { StakingService } from '../../types';

// Keep this switch aligned with `StakingService` whenever runtime service types expand.
export default function getChartDataAreaColorByServiceType(
  serviceType: StakingService,
): ChartColor {
  switch (serviceType) {
    case StakingService.ZK_SAAS_GROTH16:
      return ChartColor.GREEN;

    case StakingService.ZK_SAAS_MARLIN:
      return ChartColor.BLUE;

    case StakingService.LIGHT_CLIENT_RELAYING:
      return ChartColor.LAVENDER;

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
      return ChartColor.YELLOW;

    default:
      return ChartColor.LAVENDER;
  }
}
