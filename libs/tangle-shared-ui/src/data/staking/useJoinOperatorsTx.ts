import { useCallback } from 'react';
import { TxName } from '../../constants/staking';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';
import { BN } from '@polkadot/util';
import { SUCCESS_MESSAGES } from '../../constants/staking';

type Context = {
  bondAmount: BN;
};

const useJoinOperatorsTx = () => {
  return useSubstrateTxWithNotification<Context>(
    TxName.STAKING_JOIN_OPERATORS,
    useCallback((api, _activeSubstrateAddress, context) => {
      return api.tx.multiAssetDelegation.joinOperators(context.bondAmount);
    }, []),
    SUCCESS_MESSAGES,
  );
};

export default useJoinOperatorsTx;
