import { useCallback } from 'react';
import { TxName } from '../../constants';
import { useSubstrateTxWithNotification } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { BN } from '@polkadot/util';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

type Context = {
  bondAmount: BN;
};

const useJoinOperatorsTx = () => {
  return useSubstrateTxWithNotification<Context>(
    TxName.RESTAKE_JOIN_OPERATORS,
    useCallback((api, _activeSubstrateAddress, context) => {
      return api.tx.multiAssetDelegation.joinOperators(context.bondAmount);
    }, []),
    SUCCESS_MESSAGES,
  );
};

export default useJoinOperatorsTx;
