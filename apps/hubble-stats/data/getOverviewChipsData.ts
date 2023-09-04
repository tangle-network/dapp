import { getTvl, getDeposit24h } from './reusable';

type OverviewChipsDataType = {
  tvl: number | undefined;
  deposit24h: number | undefined;
};

export default async function getOverviewChipsData(): Promise<OverviewChipsDataType> {
  const tvl = await getTvl();
  const deposit24h = await getDeposit24h();

  return {
    tvl,
    deposit24h,
  };
}
