import { randNumber } from '@ngneat/falso';

export type PoolWrappingChartsDataType = {
  currency?: string;
  twl: number | undefined;
  wrappingFees24h: number | undefined;
  twlData: {
    date: Date;
    value: number;
  }[];
  wrappingFeesData: {
    date: Date;
    value: number;
  }[];
};

export default async function getPoolWrappingChartsData(
  poolAddress: string
): Promise<PoolWrappingChartsDataType> {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    currency: 'webbtTNT',
    twl: randNumber({ min: 10_000_000, max: 20_000_000 }),
    wrappingFees24h: randNumber({ min: 1_000, max: 10_000 }),
    twlData: [...Array(100).keys()].map((i) => {
      return {
        // Getting warning in console: Only plain objects can be passed to Client Components from Server Components. Date objects are not supported.
        // Fix: https://github.com/vercel/next.js/issues/11993#issuecomment-617375501
        date: JSON.parse(
          JSON.stringify(new Date(Date.now() + i * 24 * 60 * 60 * 1000))
        ),
        value: randNumber({ min: 1_000_000, max: 10_000_000 }),
      };
    }),
    wrappingFeesData: [...Array(100).keys()].map((i) => {
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
