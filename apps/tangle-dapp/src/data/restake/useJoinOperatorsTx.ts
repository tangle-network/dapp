import { useCallback } from 'react';
import { TxName } from '../../constants';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';
import { BN } from '@polkadot/util';

type Context = {
  bondAmount: BN;
};

const useJoinOperatorsTx = () => {
  return useSubstrateTxWithNotification<Context>(
    TxName.RESTAKE_JOIN_OPERATORS,
    useCallback((api, _activeSubstrateAddress, context) => {
      return api.tx.multiAssetDelegation.joinOperators(context.bondAmount);
    }, []),
  );
};

export default useJoinOperatorsTx;
