import { ServiceType } from '../types';

// TODO: update this to match the actual service types
export default function getChartDataAreaColorByServiceType(
  serviceType: ServiceType
) {
  switch (serviceType) {
    case ServiceType.ZK_SAAS_GROTH16:
      return '#85DC8E';
    case ServiceType.ZK_SAAS_MARLIN:
      return '#B8D6FF';
    case ServiceType.DKG_TSS_CGGMP:
      return '#FFEAA6';
    case ServiceType.TX_RELAY:
      return '#E7E2FF';
  }
}
