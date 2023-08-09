import { randNumber, randFloat } from '@ngneat/falso';

type KeyMetricDataType = {
  totalTx: number;
  txChangeRate: number;
  tvl: number;
  tvlChangeRate: number;
  volume: number;
  volumeChangeRate: number;
  fees: number;
};

export default async function getKeyMetricsData(): Promise<KeyMetricDataType> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    totalTx: randNumber({ min: 1000, max: 9999 }),
    txChangeRate: randFloat({ min: -20, max: 20, fraction: 2 }),
    tvl: randNumber({ min: 1_000_000, max: 50_000_000 }),
    tvlChangeRate: randFloat({ min: -20, max: 20, fraction: 2 }),
    volume: randNumber({ min: 20_000_000, max: 99_999_999 }),
    volumeChangeRate: randFloat({ min: -20, max: 20, fraction: 2 }),
    fees: randNumber({ min: 1000, max: 99_999 }),
  };
}
