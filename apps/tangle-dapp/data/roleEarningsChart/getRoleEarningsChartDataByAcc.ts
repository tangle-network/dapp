import { randNumber } from '@ngneat/falso';

import type { RoleEarningsChartItem } from '../../components/charts/types';
import { ServiceType } from '../../types';
import getMonthlyHistorySinceDate from '../../utils/getMonthlyHistorySinceDate';

const randNum = () => randNumber({ min: 1000, max: 4000, precision: 100 });

export default async function getRoleEarningsChartDataByAcc(
  _: string
): Promise<RoleEarningsChartItem[]> {
  return getMonthlyHistorySinceDate(new Date(2023, 0, 1)).map(
    (monthAndYear) => {
      return {
        [ServiceType.ZK_SAAS_GROTH16]: randNum(),
        [ServiceType.LIGHT_CLIENT_RELAYING]: randNum(),
        [ServiceType.TSS_ZENGOGG20SECP256K1]: randNum(),
        ...monthAndYear,
      };
    }
  );
}
