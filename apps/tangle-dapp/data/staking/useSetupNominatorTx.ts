import { BN } from '@polkadot/util';
import { useEffect } from 'react';

import useSubstrateTx from '../../hooks/useSubstrateTx';
import { StakingPayee } from '../../types';

export type NominatorSetupOptions = {
  bondAmount: BN;
  payee: StakingPayee;
  nominees: string[];
};

const useSetupNominatorTx = () => {
  return useSubstrateTx<NominatorSetupOptions>(
    (api, _activeSubstrateAddress, context) => {
      return api.tx.utility.batch([
        api.tx.staking.bond(context.bondAmount, context.payee),
        api.tx.staking.nominate(context.nominees),
      ]);
    }
  );
};

// Usage
export const useUsageExample = () => {
  const { execute } = useSetupNominatorTx();
  const aliceAddress = '5Gr...';

  useEffect(() => {
    // Transaction cannot be made yet; Api is not yet ready, or no active
    // account, etc.
    if (execute === null) {
      return;
    }

    execute({
      bondAmount: new BN(100),
      payee: StakingPayee.STASH,
      nominees: [aliceAddress],
    });
  }, [execute]);
};

export default useSetupNominatorTx;
