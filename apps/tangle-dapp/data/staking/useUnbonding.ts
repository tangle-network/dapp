import { BN, BN_ZERO } from '@polkadot/util';
import { useCallback } from 'react';

import useCurrentEra from './useCurrentEra';
import useStakingLedger from './useStakingLedger';

export type StakingUnbondingEntry = {
  amount: BN;
  unlockEra: BN;
  remainingEras: BN;
};

const useUnbonding = () => {
  const { result: currentEra } = useCurrentEra();

  return useStakingLedger(
    useCallback(
      (ledger) => {
        if (currentEra === null || ledger === null) {
          return null;
        }

        const unbonding: StakingUnbondingEntry[] = ledger.unlocking.map(
          (unlockChunk) => {
            const eraDifference = unlockChunk.era.toBn().subn(currentEra);

            return {
              amount: unlockChunk.value.toBn(),
              unlockEra: unlockChunk.era.toBn(),
              // If the era is less than the current era, the unbonding is complete.
              remainingEras: eraDifference.gtn(0) ? eraDifference : BN_ZERO,
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
