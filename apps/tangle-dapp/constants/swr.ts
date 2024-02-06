// This file defines the SWR (stale-while-revalidate) caching configuration.
// SWR is a strategy for caching fetch requests. It helps automatically avoid
// redundant requests if made again before a specified period has elapsed.
// This can be particularly useful for Polkadot API requests that return Promise objects.
// Since these requests don't always require real-time data and their responses might not
// change frequently, caching them for a particular duration can be efficient.
// These settings are centralized here for easy adjustment in the future if necessary.
// Learn more about SWR here: https://swr.vercel.app/

export type SWRConfigConst = Readonly<{
  /**
   * A unique key that helps the `useSWR` hook properly function
   * by identifying what specific data or API request is being cached.
   *
   * This key ensures that each cached response is uniquely associated
   * with a particular request.
   */
  cacheUniqueKey: string;

  /**
   * Determines how long data should be cached before a new request
   * is allowed.
   */
  refreshInterval: number;
}>;

export const SWR_ERA: SWRConfigConst = {
  cacheUniqueKey: 'era',
  // 1 hour.
  refreshInterval: 60 * 1000 * 60,
};

export const SWR_STAKING_REWARDS: SWRConfigConst = {
  cacheUniqueKey: 'staking-rewards',
  // 3 minutes.
  refreshInterval: 3 * 1000 * 60,
};
