import { rand, randNumber } from '@ngneat/falso';

import { PoolType } from '../components/PoolTypeChip/types';

type PoolOverviewType = {
  name: string;
  url: string;
  type: PoolType;
  deposits24h: number;
  depositsChangeRate: number;
  tvl: number;
  tvlChangeRate: number;
  fees24h: number;
};

export default async function getPoolOverviewData(
  poolAddress: string
): Promise<PoolOverviewType> {
  // TODO: handle if poolAddress is invalid

  return {
    name: 'webbParachain',
    url: '#',
    type: rand(['single', 'multi']),
    deposits24h: randNumber({ min: 1000, max: 9999 }),
    depositsChangeRate: randNumber({ min: -20, max: 20, fraction: 2 }),
    tvl: randNumber({ min: 1_000_000, max: 50_000_000 }),
    tvlChangeRate: randNumber({ min: -20, max: 20, fraction: 2 }),
    fees24h: randNumber({ min: 1000, max: 99_999 }),
  };
}
