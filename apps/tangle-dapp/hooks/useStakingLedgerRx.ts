import { ApiRx } from '@polkadot/api';
import { StakingLedger } from '@polkadot/types/interfaces';
import { map } from 'rxjs';

import usePolkadotApiRx from './usePolkadotApiRx';

export type LedgerObservableFactory<T> = (
  ledger: StakingLedger,
  api: ApiRx
) => Promise<T>;

function useStakingLedgerRx<T>(createObservable: LedgerObservableFactory<T>) {
  return usePolkadotApiRx((api, activeAccountAddress) => {
    return (
      api.query.staking
        .ledger(activeAccountAddress)
        // TODO: Error handling.
        .pipe(map((ledgerOpt) => ledgerOpt.unwrapOrDefault()))
        .pipe(map((ledger) => createObservable(ledger, api)))
    );
  });
}

export default useStakingLedgerRx;
