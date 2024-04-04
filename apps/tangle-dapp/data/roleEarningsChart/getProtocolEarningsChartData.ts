import { randNumber } from '@ngneat/falso';

import type { RoleEarningsChartItem } from '../../components/charts/types';

const randNum = () => randNumber({ min: 1000, max: 4000, precision: 100 });

export default async function getProtocolEarningsChartData(): Promise<
  RoleEarningsChartItem[]
> {
  return Array.from({ length: randNumber({ min: 10, max: 20 }) }).map(
    (_, idx) => ({
      era: idx + 1,
      reward: randNum(),
    })
  );
}
