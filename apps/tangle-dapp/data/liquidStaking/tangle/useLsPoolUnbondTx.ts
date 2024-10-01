import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '../../../hooks/useSubstrateTx';

export type LsPoolUnbondTxContext = {
  poolId: number;
  points: BN;
};

const useLsPoolUnbondTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsPoolUnbondTxContext> =
    useCallback(async (api, activeSubstrateAddress, { poolId, points }) => {
      return api.tx.lst.unbond({ Id: activeSubstrateAddress }, poolId, points);
    }, []);

  // TODO: Add EVM support once precompile(s) for the `lst` pallet are implemented on Tangle.
  return useSubstrateTxWithNotification(
    TxName.LS_TANGLE_POOL_UNBOND,
    substrateTxFactory,
  );
};

export default useLsPoolUnbondTx;
