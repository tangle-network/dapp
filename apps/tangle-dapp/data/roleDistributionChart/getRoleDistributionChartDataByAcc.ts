import type { ProportionPieChartItem } from '../../components/charts/types';
import { ServiceType } from '../../types';
import { getChartDataAreaColorByServiceType } from '../../utils';

export default async function getRoleDistributionChartDataByAcc(
  _: string
): Promise<ProportionPieChartItem[]> {
  const data = [
    { name: ServiceType.ZK_SAAS_GROTH16, value: 400 },
    { name: ServiceType.ZK_SAAS_MARLIN, value: 300 },
    { name: ServiceType.LIGHT_CLIENT_RELAYING, value: 300 },
    { name: ServiceType.TSS_ZENGOGG20SECP256K1, value: 200 },
  ];

  return data.map((role) => {
    return { ...role, color: getChartDataAreaColorByServiceType(role.name) };
  });
}
