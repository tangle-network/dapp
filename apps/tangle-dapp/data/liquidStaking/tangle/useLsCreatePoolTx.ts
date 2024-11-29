import { BN } from '@polkadot/util';
import { SubstrateAddress } from '@webb-tools/tangle-shared-ui/types/utils';
import { useCallback } from 'react';
import { Address } from 'viem';

import { TxName } from '../../../constants';
import { Precompile } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';
import { toSubstrateAddress } from '../../../utils';
import toEvmAddress32 from '../../../utils/toEvmAddress32';

export type LsCreatePoolTxContext = {
  name: string;
  initialBondAmount: BN;
  rootAddress: Address | SubstrateAddress;
  nominatorAddress: Address | SubstrateAddress;
  bouncerAddress: Address | SubstrateAddress;
};

const useLsCreatePoolTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsCreatePoolTxContext> =
    useCallback(async (api, _activeSubstrateAddress, context) => {
      return api.tx.lst.create(
        context.initialBondAmount,
        toSubstrateAddress(context.rootAddress),
        toSubstrateAddress(context.nominatorAddress),
        toSubstrateAddress(context.bouncerAddress),
        context.name,
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
