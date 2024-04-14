import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import useSubstrateTx from '../../hooks/useSubstrateTx';
import { StakingRewardsDestination } from '../../types';
import optimizeTxBatch from '../../utils/optimizeTxBatch';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';

export type NominationOptions = {
  bondAmount: BN;
  payee: StakingRewardsDestination;
  nominees: string[];
};

const useSetupNominatorTx = () => {
  // TODO: EVM support.

  return useSubstrateTx<NominationOptions>(
    useCallback((api, _activeSubstrateAddress, context) => {
      const payee = getSubstratePayeeValue(context.payee);

      return optimizeTxBatch(api, [
        api.tx.staking.bond(context.bondAmount, payee),
        api.tx.staking.nominate(context.nominees),
      ]);
    }, [])
  );
};

export default useSetupNominatorTx;
