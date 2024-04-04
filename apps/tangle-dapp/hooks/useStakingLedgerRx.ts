import { ApiRx } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from './usePolkadotApiRx';
import useSubstrateAddress from './useSubstrateAddress';

/**
 * A function provided by the consumer of the {@link useStakingLedgerRx}
 * hook to select which data to fetch from the ledger.
 */
export type StakingLedgerFetcherRx<T> = (
  ledger: StakingLedger,
  api: ApiRx
) => T;

function useStakingLedgerRx<T>(fetcher: StakingLedgerFetcherRx<T>) {
  const activeSubstrateAddress = useSubstrateAddress();

  return usePolkadotApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) return null;
        return (
          api.query.staking
            .ledger(activeSubstrateAddress)
            // TODO: Error handling. Under what circumstances would the ledger be `None`?
            .pipe(map((ledgerOpt) => fetcher(ledgerOpt.unwrap(), api)))
        );
      },
      [fetcher, activeSubstrateAddress]
    )
  );
}

export default useStakingLedgerRx;
