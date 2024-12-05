import { BN } from '@polkadot/util';
import { toSubstrateAddress } from '@webb-tools/webb-ui-components';
import { AnyAddress } from '@webb-tools/webb-ui-components/types/address';
import toEvmAddress32 from '@webb-tools/webb-ui-components/utils/toEvmAddress32';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { Precompile } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';

export type LsCreatePoolTxContext = {
  name?: string;
  iconUrl?: string;
  initialBondAmount: BN;
  rootAddress: AnyAddress;
  nominatorAddress: AnyAddress;
  bouncerAddress: AnyAddress;
};

const useLsCreatePoolTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsCreatePoolTxContext> =
    useCallback(async (api, _activeSubstrateAddress, context) => {
      return api.tx.lst.create(
        context.initialBondAmount,
        toSubstrateAddress(context.rootAddress),
        toSubstrateAddress(context.nominatorAddress),
        toSubstrateAddress(context.bouncerAddress),
        context.name ?? null,
        context.iconUrl ?? null,
      );
    }, []);

  const evmTxFactory: EvmTxFactory<Precompile.LST, LsCreatePoolTxContext> =
    useCallback((context) => {
      // TODO: This will fail if the address is an EVM address.
      const rootEvmAddress32 = toEvmAddress32(context.rootAddress);
      const nominatorEvmAddress32 = toEvmAddress32(context.nominatorAddress);
      const bouncerEvmAddress32 = toEvmAddress32(context.bouncerAddress);

      return {
        functionName: 'create',
        // TODO: What's going on with the pool name? It's not accepted by the precompile function it seems.
        arguments: [
          context.initialBondAmount,
          rootEvmAddress32,
          nominatorEvmAddress32,
          bouncerEvmAddress32,
        ],
      };
    }, []);

  return useAgnosticTx<Precompile.LST, LsCreatePoolTxContext>({
    name: TxName.LS_TANGLE_POOL_CREATE,
    precompile: Precompile.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsCreatePoolTx;
