import { randNumber } from '@ngneat/falso';

import type { RoleEarningsChartItem } from '../../components/charts/types';
import { GENESIS_BLOCK_DATE } from '../../constants';
import { ServiceType } from '../../types';
import getMonthlyHistorySinceDate from '../../utils/getMonthlyHistorySinceDate';

const randNum = () => randNumber({ min: 1000, max: 4000, precision: 100 });

export default async function getRoleEarningsChartDataByAcc(
  _: string
): Promise<RoleEarningsChartItem[]> {
  return getMonthlyHistorySinceDate(GENESIS_BLOCK_DATE).map((monthAndYear) => {
    return {
      [ServiceType.ZK_SAAS_GROTH16]: randNum(),
      [ServiceType.TX_RELAY]: randNum(),
      [ServiceType.DKG_TSS_CGGMP]: randNum(),
      ...monthAndYear,
    };
  });
}
