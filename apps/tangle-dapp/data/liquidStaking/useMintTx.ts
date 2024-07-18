// This will override global types and provide type definitions for
// the `lstMinting` pallet, allowing us to use the `mint` extrinsic.
import '@webb-tools/tangle-restaking-types';

import { Bytes } from '@polkadot/types';
import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { TxName } from '../../constants';
import {
  LiquidStakingCurrency,
  LiquidStakingCurrencyKey,
} from '../../constants/liquidStaking';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';

export type MintTxContext = {
  amount: BN;
  currency: LiquidStakingCurrency;
};

const useMintTx = () => {
  // TODO: Add support for EVM accounts once precompile(s) for the `lstMinting` pallet are implemented on Tangle.

  return useSubstrateTxWithNotification<MintTxContext>(
    TxName.MINT,
    (api, _activeSubstrateAddress, context) => {
      const key: LiquidStakingCurrencyKey = { Native: context.currency };

      // TODO: Investigate what the `remark` and `channel` parameters are for, and whether they are relevant for us here.
      return api.tx.lstMinting.mint(key, context.amount, Bytes.from([]), null);
    },
    undefined,
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useMintTx;
