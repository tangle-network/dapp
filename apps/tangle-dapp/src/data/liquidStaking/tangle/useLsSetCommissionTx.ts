import { toSubstrateAddress } from '@tangle-network/ui-components';
import { AnyAddress } from '@tangle-network/ui-components/types/address';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { SUCCESS_MESSAGES } from '../../../hooks/useTxNotification';

export type LsPoolSetCommissionTxContext = {
  poolId: number;
  commissionFractional: number;
  payeeAccountAddress: AnyAddress;
};

const useLsSetCommissionTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsPoolSetCommissionTxContext> =
    useCallback(
      async (
        api,
        _activeSubstrateAddress,
        { poolId, commissionFractional, payeeAccountAddress },
      ) => {
        const payeeSubstrateAddress = toSubstrateAddress(payeeAccountAddress);

        const commissionPerbill = commissionFractional * 1_000_000_000;

        return api.tx.lst.setCommission(poolId, [
          commissionPerbill,
          payeeSubstrateAddress,
        ]);
      },
      [],
    );

  // TODO: The LST EVM precompile is missing the `setCommission` function. Implement EVM support once the precompile adds it.
  return useSubstrateTxWithNotification(
    TxName.LST_UPDATE_COMMISSION,
    substrateTxFactory,
    SUCCESS_MESSAGES,
  );
};

export default useLsSetCommissionTx;
