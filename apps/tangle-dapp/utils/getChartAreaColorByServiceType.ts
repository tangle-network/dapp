import { ChartColor } from '../constants';
import { ServiceType } from '../types';

// TODO: update this to match the actual service types
export default function getChartDataAreaColorByServiceType(
  serviceType: ServiceType
): ChartColor {
  switch (serviceType) {
    case ServiceType.ZK_SAAS_GROTH16:
      return ChartColor.GREEN;
    case ServiceType.ZK_SAAS_MARLIN:
      return ChartColor.BLUE;
    case ServiceType.DKG_TSS_CGGMP:
      return ChartColor.YELLOW;
    case ServiceType.TX_RELAY:
      return ChartColor.LAVENDER;
  }
}
