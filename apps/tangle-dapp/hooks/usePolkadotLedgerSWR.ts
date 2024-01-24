import { ApiPromise } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { DependencyList } from 'react';

import { SWRConfigConst } from '../constants';
import usePolkadotApi from './usePolkadotApi';

export type PolkadotLedgerFetcher<T> = (
  ledger: StakingLedger,
  api: ApiPromise
) => Promise<T>;

function usePolkadotLedgerSWR<T>(
  swrConfig: SWRConfigConst,
  fetcher: PolkadotLedgerFetcher<T>,
  deps: DependencyList = []
) {
  const activeAccount = useActiveAccount();

  return usePolkadotApi(
    swrConfig,
    async (api) => {
      const activeAccountAddress = activeAccount?.[0]?.address;

      if (!activeAccountAddress) {
        return Promise.resolve(null);
      }

      const ledger = await api.query.staking
        .ledger(activeAccountAddress)
        // TODO: Error handling.
        .then((ledger) => ledger.unwrapOrDefault());

      return fetcher(ledger, api);
    },
    [activeAccount, ...deps]
  );
}

export default usePolkadotLedgerSWR;
