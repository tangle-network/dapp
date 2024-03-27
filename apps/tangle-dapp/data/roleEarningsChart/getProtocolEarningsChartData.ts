import { randNumber } from '@ngneat/falso';

import type { RoleEarningsChartItem } from '../../components/charts/types';
import { RestakingService } from '../../types';
import { getMonthlyHistorySinceDate } from '../../utils';

const randNum = () => randNumber({ min: 1000, max: 4000, precision: 100 });

export default async function getProtocolEarningsChartData(): Promise<
  RoleEarningsChartItem[]
> {
  return getMonthlyHistorySinceDate(new Date(2023, 0, 1)).map(
    (monthAndYear) => {
      return {
        [RestakingService.ZK_SAAS_GROTH16]: randNum(),
        [RestakingService.LIGHT_CLIENT_RELAYING]: randNum(),
        [RestakingService.TSS_SILENT_SHARD_DKLS23SECP256K1]: randNum(),
        ...monthAndYear,
      };
    }
  );
}
