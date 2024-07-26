import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { TxName } from '../../constants';
import {
  ParachainCurrency,
  ParachainCurrencyKey,
} from '../../constants/liquidStaking';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';

type LstRebondTxContext = {
  currency: ParachainCurrency;
  unlockIds: number[];
};

const useLstRebondTx = () => {
  // TODO: Add support for EVM accounts once precompile(s) for the `lstMinting` pallet are implemented on Tangle.

  return useSubstrateTxWithNotification<LstRebondTxContext>(
    TxName.LST_REBOND,
    (api, _activeSubstrateAddress, context) => {
      const key: ParachainCurrencyKey = { Native: context.currency };

      const txs = context.unlockIds.map((unlockId) => {
        return api.tx.lstMinting.rebondByUnlockId(key, unlockId);
      });

      return optimizeTxBatch(api, txs);
    },
    undefined,
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useLstRebondTx;
