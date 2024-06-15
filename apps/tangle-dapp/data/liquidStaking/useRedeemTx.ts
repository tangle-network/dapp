// This will override global types and provide type definitions for
// the `lstMinting` pallet, allowing us to use the `redeem` extrinsic.
import '@webb-tools/tangle-restaking-types';

import { TanglePrimitivesCurrencyTokenSymbol } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import useSubstrateTx from '../../hooks/useSubstrateTx';

export type RedeemTxContext = {
  amount: BN;
  currency: TanglePrimitivesCurrencyTokenSymbol['type'];
};

const useRedeemTx = () => {
  // TODO: Add support for EVM accounts once precompile(s) for the `lstMinting` pallet are implemented on Tangle.

  return useSubstrateTx<RedeemTxContext>(
    (api, _activeSubstrateAddress, context) =>
      api.tx.lstMinting.redeem({ lst: context.currency }, context.amount),
    undefined,
    undefined,
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useRedeemTx;
