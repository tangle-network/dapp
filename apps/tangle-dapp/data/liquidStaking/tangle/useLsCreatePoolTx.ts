import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import {
  SubstrateTxFactory,
  useSubstrateTxWithNotification,
} from '../../../hooks/useSubstrateTx';
import { SubstrateAddress } from '../../../types/utils';

export type LsCreatePoolTxContext = {
  name: string;
  initialBondAmount: BN;
  rootAddress: SubstrateAddress;
  nominatorAddress: SubstrateAddress;
  bouncerAddress: SubstrateAddress;
};

const useLsCreatePoolTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsCreatePoolTxContext> =
    useCallback(
      async (
        api,
        _activeSubstrateAddress,
        {
          name,
          initialBondAmount,
          rootAddress,
          nominatorAddress,
          bouncerAddress,
        },
      ) => {
        return api.tx.lst.create(
          initialBondAmount,
          rootAddress,
          nominatorAddress,
          bouncerAddress,
          name,
        );
      },
      [],
    );

  // TODO: Add EVM support once precompile(s) for the `lst` pallet are implemented on Tangle.
  return useSubstrateTxWithNotification(
    TxName.LS_TANGLE_POOL_JOIN,
    substrateTxFactory,
  );
};

export default useLsCreatePoolTx;
