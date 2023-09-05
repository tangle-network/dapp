import { randNumber } from '@ngneat/falso';

export type PoolChartsDataType = {
  currency?: string;
  tvl: number | undefined;
  deposit24h: number | undefined;
  relayerEarnings24h: number | undefined;
  tvlData: {
    date: Date;
    value: number;
  }[];
  volumeData: {
    date: Date;
    deposit: number;
    withdrawal: number;
  }[];
  relayerEarningsData: {
    date: Date;
    value: number;
  }[];
};

export default async function getPoolChartsData(
  poolAddress: string
): Promise<PoolChartsDataType> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    currency: 'webbtTNT',
    tvl: randNumber({ min: 10_000_000, max: 20_000_000 }),
    deposit24h: randNumber({ min: 1_000_000, max: 10_000_000 }),
    relayerEarnings24h: randNumber({ min: 1_000, max: 10_000 }),
    tvlData: [...Array(100).keys()].map((i) => {
      return {
        // Getting warning in console: Only plain objects can be passed to Client Components from Server Components. Date objects are not supported.
        // Fix: https://github.com/vercel/next.js/issues/11993#issuecomment-617375501
        date: JSON.parse(
          JSON.stringify(new Date(Date.now() + i * 24 * 60 * 60 * 1000))
        ),
        value: randNumber({ min: 1_000_000, max: 10_000_000 }),
      };
    }),
    volumeData: [...Array(100).keys()].map((i) => {
      return {
        // Getting warning in console: Only plain objects can be passed to Client Components from Server Components. Date objects are not supported.
        // Fix: https://github.com/vercel/next.js/issues/11993#issuecomment-617375501
        date: JSON.parse(
          JSON.stringify(new Date(Date.now() + i * 24 * 60 * 60 * 1000))
        ),
        deposit: randNumber({ min: 1_000_000, max: 10_000_000 }),
        withdrawal: randNumber({ min: 1_000_000, max: 10_000_000 }),
      };
    }),
    relayerEarningsData: [...Array(100).keys()].map((i) => {
      return {
        // Getting warning in console: Only plain objects can be passed to Client Components from Server Components. Date objects are not supported.
        // Fix: https://github.com/vercel/next.js/issues/11993#issuecomment-617375501
        date: JSON.parse(
          JSON.stringify(new Date(Date.now() + i * 24 * 60 * 60 * 1000))
        ),
        value: randNumber({ min: 1_000_000, max: 10_000_000 }),
      };
    }),
  };
}
