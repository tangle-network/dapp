import { BN } from '@polkadot/util';

import useSubstrateTx from '../../hooks/useSubstrateTx';
import { StakingPayee } from '../../types';

export type NominationOptions = {
  bondAmount: BN;
  payee: StakingPayee;
  nominees: string[];
};

const useSetupNominatorTx = () => {
  // TODO: EVM support.

  return useSubstrateTx<NominationOptions>(
    (api, _activeSubstrateAddress, context) => {
      return api.tx.utility.batch([
        api.tx.staking.bond(context.bondAmount, context.payee),
        api.tx.staking.nominate(context.nominees),
      ]);
    }
  );
};

export default useSetupNominatorTx;
