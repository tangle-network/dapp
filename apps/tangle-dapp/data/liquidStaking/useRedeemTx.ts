// This will override global types and provide type definitions for
// the `lstMinting` pallet, allowing us to use the `redeem` extrinsic.
import '@webb-tools/tangle-restaking-types';

import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import { TxName } from '../../constants';
import {
  ParachainCurrency,
  ParachainCurrencyKey,
} from '../../constants/liquidStaking';
import { useSubstrateTxWithNotification } from '../../hooks/useSubstrateTx';

export type RedeemTxContext = {
  amount: BN;
  currency: ParachainCurrency;
};

const useRedeemTx = () => {
  // TODO: Add support for EVM accounts once precompile(s) for the `lstMinting` pallet are implemented on Tangle.
  // TODO: Consider moving checks, such as checking that the provided amount equals or greater than 'minimumMint' amount here instead of in the consumer of this hook.

  return useSubstrateTxWithNotification<RedeemTxContext>(
    TxName.REDEEM,
    (api, _activeSubstrateAddress, context) => {
      const key: ParachainCurrencyKey = { lst: context.currency };

      return api.tx.lstMinting.redeem(key, context.amount);
    },
    undefined,
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useRedeemTx;
