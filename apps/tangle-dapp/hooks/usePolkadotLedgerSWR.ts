import { ApiPromise } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { DependencyList } from 'react';

import { SWRConfigConst } from '../constants';
import usePolkadotApi from './usePolkadotApi';
import useSubstrateAddress from './useSubstrateAddress';

export type PolkadotLedgerFetcher<T> = (
  ledger: StakingLedger,
  api: ApiPromise
) => Promise<T>;

function usePolkadotLedgerSWR<T>(
  swrConfig: SWRConfigConst,
  fetcher: PolkadotLedgerFetcher<T>,
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

export default usePolkadotLedgerSWR;
