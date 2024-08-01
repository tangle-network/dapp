import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { TxName } from '../../constants';
import {
  ParachainCurrency,
  ParachainCurrencyKey,
} from '../../constants/liquidStaking';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';

type LstRebondTxContext = {
  currenciesAndUnlockIds: [ParachainCurrency, number][];
};

const useLstRebondTx = () => {
  // TODO: Add support for EVM accounts once precompile(s) for the `lstMinting` pallet are implemented on Tangle.

  return useSubstrateTxWithNotification<LstRebondTxContext>(
    TxName.LST_REBOND,
    (api, _activeSubstrateAddress, context) => {
      const txs = context.currenciesAndUnlockIds.map(([currency, unlockId]) => {
        const key: ParachainCurrencyKey = { Native: currency };

        return api.tx.lstMinting.rebondByUnlockId(key, unlockId);
      });

      return optimizeTxBatch(api, txs);
    },
    undefined,
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useLstRebondTx;
