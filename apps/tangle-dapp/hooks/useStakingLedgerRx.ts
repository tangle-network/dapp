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
  ledger: StakingLedger | null,
  api: ApiRx
) => T;

function useStakingLedgerRx<T>(fetcher: StakingLedgerFetcherRx<T>) {
  const activeSubstrateAddress = useSubstrateAddress();

  return usePolkadotApiRx(
    useCallback(
      (api) => {
        if (!activeSubstrateAddress) return null;
        return api.query.staking
          .ledger(activeSubstrateAddress)
          .pipe(map((ledgerOpt) => fetcher(ledgerOpt.unwrapOr(null), api)));
      },
      [fetcher, activeSubstrateAddress]
    )
  );
}

export default useStakingLedgerRx;
