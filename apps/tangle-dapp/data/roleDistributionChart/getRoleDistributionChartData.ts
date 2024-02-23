import type { ProportionPieChartItem } from '../../components/charts/types';
import { ServiceType } from '../../types';
import { getChartAreaColorByServiceType } from '../../utils';

export default async function getRoleDistributionChartData(): Promise<
  ProportionPieChartItem[]
> {
  const data = [
    { name: ServiceType.ZK_SAAS_GROTH16, value: 400 },
    { name: ServiceType.ZK_SAAS_MARLIN, value: 300 },
    { name: ServiceType.TX_RELAY, value: 300 },
    { name: ServiceType.DKG_TSS_CGGMP, value: 200 },
  ];

  return data.map((role) => {
    return { ...role, color: getChartAreaColorByServiceType(role.name) };
  });
}
