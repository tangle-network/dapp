import { ApiPromise } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { DependencyList } from 'react';

import { SWRConfigConst } from '../constants';
import usePolkadotApi from './usePolkadotApi';
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
 * @remarks
 * The SWR (Stale-While-Revalidate) caching & revalidation strategy
 * is used under the hood, so its configuration is needed to configure
 * the re-fetching polling interval. [Learn more about SWR](https://swr.vercel.app/).
 */
function useStakingLedger<T>(
  swrConfig: SWRConfigConst,
  fetcher: StakingLedgerFetcher<T>,
  deps: DependencyList = []
) {
  const activeSubstrateAddress = useSubstrateAddress();

  return usePolkadotApi(
    swrConfig,
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
    [activeSubstrateAddress, ...deps]
  );
}

export default useStakingLedger;
