import type { PieChartItem } from '../../components/charts/types';
import { ServiceType } from '../../types';
import { getChartAreaColorByServiceType } from '../../utils';

export default async function getRoleDistributionChartData(): Promise<
  PieChartItem[]
> {
  const data = [
    { name: ServiceType.ZK_SAAS_GROTH16, value: 4400 },
    { name: ServiceType.ZK_SAAS_MARLIN, value: 3200 },
    { name: ServiceType.TX_RELAY, value: 3000 },
    { name: ServiceType.DKG_TSS_CGGMP, value: 2300 },
  ];

  return data.map((role) => {
    return { ...role, color: getChartAreaColorByServiceType(role.name) };
  });
}
