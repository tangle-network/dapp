import { ApiRx } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { useCallback } from 'react';
import { map, of } from 'rxjs';

import Optional from '../utils/Optional';
import useApiRx from './useApiRx';
import useSubstrateAddress from './useSubstrateAddress';

/**
 * A function provided by the consumer of the {@link useStakingLedger}
 * hook to select which data to fetch from the ledger.
 */
export type StakingLedgerFetcher<T extends NonNullable<unknown>> = (
  ledger: StakingLedger,
  api: ApiRx
) => T | null;

function useStakingLedger<T extends NonNullable<unknown>>(
  fetcher: StakingLedgerFetcher<T>
) {
  const activeSubstrateAddress = useSubstrateAddress();

  return useApiRx<Optional<T> | null>(
    useCallback(
      (api) => {
        if (activeSubstrateAddress === null) {
          return of(null);
        }

        return api.query.staking.ledger(activeSubstrateAddress).pipe(
          map((ledgerOpt) => {
            // TODO: Need to research under what circumstances the ledger would be `None`, and explain that here.
            if (ledgerOpt.isNone) {
              return new Optional();
            }

            const result = fetcher(ledgerOpt.unwrap(), api);

            // If the fetcher indicates that it is not ready, do the same
            // here.
            if (result === null) {
              return null;
            }

            return new Optional(result);
          })
        );
      },
      [fetcher, activeSubstrateAddress]
    )
  );
}

export default useStakingLedger;
