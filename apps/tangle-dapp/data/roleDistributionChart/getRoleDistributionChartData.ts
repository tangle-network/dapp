import type { PieChartItem } from '../../components/charts/types';
import { RestakingService } from '../../types';
import { getChartDataAreaColorByServiceType } from '../../utils';

export default async function getRoleDistributionChartData(): Promise<
  PieChartItem[]
> {
  const data = [
    { name: RestakingService.ZK_SAAS_GROTH16, value: 4400 },
    { name: RestakingService.ZK_SAAS_MARLIN, value: 3200 },
    { name: RestakingService.LIGHT_CLIENT_RELAYING, value: 3000 },
    { name: RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1, value: 2300 },
  ];

  return data.map((role) => {
    return { ...role, color: getChartDataAreaColorByServiceType(role.name) };
  });
}
