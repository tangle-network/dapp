import { useCallback } from 'react';

import { TxName } from '../../constants';
import {
  LsParachainCurrencyKey,
  ParachainCurrency,
} from '../../constants/liquidStaking/types';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';
import optimizeTxBatch from '../../utils/optimizeTxBatch';

type LstWithdrawRedeemTxContext = {
  currenciesAndUnlockIds: [ParachainCurrency, number][];
};

const useLstWithdrawRedeemTx = () => {
  return useSubstrateTxWithNotification<LstWithdrawRedeemTxContext>(
    TxName.LST_WITHDRAW_REDEEM,
    useCallback((api, _activeSubstrateAddress, context) => {
      const txs = context.currenciesAndUnlockIds.map(([currency, unlockId]) => {
        const key: LsParachainCurrencyKey = { Native: currency };

        // TODO: This should be `withdrawRedeem`, but the type defs of the restaking parachain haven't been updated yet. So, this is only temporary/dummy data. Once it is implemented, it should be a quick change here.
        return api.tx.lstMinting.rebondByUnlockId(key, unlockId);
      });

      return optimizeTxBatch(api, txs);
    }, []),
  );
};

export default useLstWithdrawRedeemTx;
