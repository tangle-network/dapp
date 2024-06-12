// This will override global types and provide type definitions for
// the `lstMinting` pallet, allowing us to use the `mint` extrinsic.
import '@webb-tools/tangle-restaking-types';

import { TanglePrimitivesCurrencyCurrencyId } from '@polkadot/types/lookup';
import { BN } from '@polkadot/util';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import useSubstrateTx from '../../hooks/useSubstrateTx';

export type MintTxContext = {
  amount: BN;
  currency: TanglePrimitivesCurrencyCurrencyId['type'];
};

const useMintTx = () => {
  // TODO: Add support for EVM accounts once precompile(s) for the `lstMinting` pallet are implemented on Tangle.

  return useSubstrateTx<MintTxContext>(
    (api, _activeSubstrateAddress, context) =>
      // TODO: Investigate what the `remark` and `channel` parameters are for.
      api.tx.lstMinting.mint(context.currency, context.amount, '', null),
    undefined,
    undefined,
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );
};

export default useMintTx;
