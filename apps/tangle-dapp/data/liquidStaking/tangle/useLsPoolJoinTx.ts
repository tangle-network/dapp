import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '../../../hooks/useSubstrateTx';

export type LsPoolJoinTxContext = {
  poolId: number;
  amount: BN;
};

const useLsPoolJoinTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsPoolJoinTxContext> =
    useCallback(async (api, _activeSubstrateAddress, { poolId, amount }) => {
      return api.tx.lst.join(amount, poolId);
    }, []);

  // TODO: Add EVM support once precompile(s) for the `lst` pallet are implemented on Tangle.
  return useSubstrateTxWithNotification(
    TxName.LS_TANGLE_POOL_JOIN,
    substrateTxFactory,
  );
};

export default useLsPoolJoinTx;
