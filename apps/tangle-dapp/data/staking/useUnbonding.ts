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
          (unlockChunk) => {
            const eraDifference = unlockChunk.era.toBn().sub(currentEra);

            return {
              amount: unlockChunk.value.toBn(),
              unlockEra: unlockChunk.era.toBn(),
              remainingEras: eraDifference.gtn(0) ? eraDifference : new BN(0),
            };
          }
        );

        return unbonding;
      },
      [currentEra]
    )
  );
};

export default useUnbonding;
