import type { PieChartItem } from '../../components/charts/types';
import { ServiceType } from '../../types';
import { getChartDataAreaColorByServiceType } from '../../utils';

export default async function getRoleDistributionChartData(): Promise<
  PieChartItem[]
> {
  const data = [
    { name: ServiceType.ZK_SAAS_GROTH16, value: 4400 },
    { name: ServiceType.ZK_SAAS_MARLIN, value: 3200 },
    { name: ServiceType.LIGHT_CLIENT_RELAYING, value: 3000 },
    { name: ServiceType.TSS_ZENGOGG20SECP256K1, value: 2300 },
  ];

  return data.map((role) => {
    return { ...role, color: getChartDataAreaColorByServiceType(role.name) };
  });
}
