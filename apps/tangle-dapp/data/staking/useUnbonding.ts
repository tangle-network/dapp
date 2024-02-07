import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import useStakingLedgerRx from '../../hooks/useStakingLedgerRx';
import useCurrentEra from './useCurrentEra';

export type StakingUnbondingEntry = {
  amount: BN;
  unlockEra: BN;
  remainingEras: BN;
};

const useUnbonding = () => {
  const { data: currentEra } = useCurrentEra();

  return useStakingLedgerRx(
    useCallback(
      (ledger) => {
        if (currentEra === null) {
          return null;
        }

        const unbonding: StakingUnbondingEntry[] = ledger.unlocking.map(
          (unlockChunk) => ({
            amount: unlockChunk.value.toBn(),
            unlockEra: unlockChunk.era.toBn(),
            remainingEras: currentEra.sub(unlockChunk.era.toBn()),
          })
        );

        return unbonding;
      },
      [currentEra]
    )
  );
};

export default useUnbonding;
