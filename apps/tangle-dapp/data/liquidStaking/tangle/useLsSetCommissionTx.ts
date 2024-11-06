import { useCallback } from 'react';
import { Address } from 'viem';

import { TxName } from '../../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '../../../hooks/useSubstrateTx';
import { SubstrateAddress } from '../../../types/utils';
import { toSubstrateAddress } from '../../../utils';

export type LsPoolSetCommissionTxContext = {
  poolId: number;
  commissionFractional: number;
  payeeAccountAddress: SubstrateAddress | Address;
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

  // TODO: Add EVM support once precompile(s) for the `lst` pallet are implemented on Tangle.
  return useSubstrateTxWithNotification(
    TxName.LST_UPDATE_COMMISSION,
    substrateTxFactory,
  );
};

export default useLsSetCommissionTx;
