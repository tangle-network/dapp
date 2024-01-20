export type SWRConfigConst = Readonly<{
  cacheUniqueKey: string;
  refreshInterval: number;
}>;

export const SWR_STAKING_ERA: SWRConfigConst = {
  cacheUniqueKey: 'staking-era',
  // 1 hour.
  refreshInterval: 1000 * 60 * 60,
};
