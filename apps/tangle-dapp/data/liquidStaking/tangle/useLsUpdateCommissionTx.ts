import { useCallback } from 'react';

import { TxName } from '../../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '../../../hooks/useSubstrateTx';

export type LsPoolUpdateCommissionTxContext = {
  poolId: number;
  commission: number;
};

const useLsUpdateCommissionTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsPoolUpdateCommissionTxContext> =
    useCallback(
      async (api, _activeSubstrateAddress, { poolId, commission }) => {
        return api.tx.lst.setCommission(poolId, commission);
      },
      [],
    );

  // TODO: Add EVM support once precompile(s) for the `lst` pallet are implemented on Tangle.
  return useSubstrateTxWithNotification(
    TxName.LST_UPDATE_COMMISSION,
    substrateTxFactory,
  );
};

export default useLsUpdateCommissionTx;
