import { ChartColor } from '../constants';
import { ServiceType } from '../types';

// TODO: update this to match the actual service types
export default function getChartDataAreaColorByServiceType(
  serviceType: ServiceType
): ChartColor {
  switch (serviceType) {
    case ServiceType.ZK_SAAS_GROTH16:
      return ChartColor.Green;
    case ServiceType.ZK_SAAS_MARLIN:
      return ChartColor.Blue;
    case ServiceType.DKG_TSS_CGGMP:
      return ChartColor.Yellow;
    case ServiceType.TX_RELAY:
      return ChartColor.Lavender;
  }
}
