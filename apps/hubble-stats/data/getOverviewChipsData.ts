import { randNumber } from '@ngneat/falso';

type OverviewChipsDataType = {
  tvl: number;
  volume: number;
};

export default async function getOverviewChipsData(): Promise<OverviewChipsDataType> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    tvl: randNumber({ min: 10_000_000, max: 99_999_999 }),
    volume: randNumber({ min: 1_000_000, max: 9_999_999 }),
  };
}
