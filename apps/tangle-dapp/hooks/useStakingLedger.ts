import { ApiPromise } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { useCallback } from 'react';

import usePolkadotApi, {
  PolkadotApiFetcher,
  PolkadotApiSwrKey,
} from './usePolkadotApi';
import useSubstrateAddress from './useSubstrateAddress';

/**
 * A function provided by the consumer of the `useStakingLedger`
 * hook to select which data to fetch from the ledger.
 */
export type StakingLedgerFetcher<T> = (
  ledger: StakingLedger,
  api: ApiPromise
) => Promise<T>;

/**
 * Allows the retrieval of data from the Substrate staking ledger, by
 * providing a function which selects the data needed.
 *
 * @param fetcher - A function that selects the data to fetch from the ledger.
 * This function should **always** be memoized using `useCallback`.
 *
 * @param swrKey - The SWR (Stale-While-Revalidate) configuration key. This will
 * determine the refresh and deduping interval for the SWR request. If omitted,
 * the fetcher will only be called once, and not refreshed automatically.
 *
 * @remarks
 * The SWR (Stale-While-Revalidate) caching & revalidation strategy
 * is used under the hood, so its configuration key is needed to configure
 * the re-fetching polling interval. [Learn more about SWR](https://swr.vercel.app/).
 */
function useStakingLedger<T>(
  fetcher: StakingLedgerFetcher<T>,
  swrKey?: PolkadotApiSwrKey
) {
  const activeSubstrateAddress = useSubstrateAddress();

  const fetcherWithLedger = useCallback<PolkadotApiFetcher<T | null>>(
    async (api) => {
      if (activeSubstrateAddress === null) {
        return Promise.resolve(null);
      }

      const ledger = await api.query.staking
        .ledger(activeSubstrateAddress)
        // TODO: Error handling.
        .then((ledger) => ledger.unwrapOrDefault());

      return fetcher(ledger, api);
    },
    [activeSubstrateAddress, fetcher]
  );

  return usePolkadotApi(fetcherWithLedger, swrKey);
}

export default useStakingLedger;
