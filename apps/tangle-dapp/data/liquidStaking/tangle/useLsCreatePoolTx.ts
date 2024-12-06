import { BN } from '@polkadot/util';
import { toSubstrateAddress } from '@webb-tools/webb-ui-components';
import { AnyAddress } from '@webb-tools/webb-ui-components/types/address';
import toSubstrateBytes32Address from '@webb-tools/webb-ui-components/utils/toSubstrateBytes32Address';
import { useCallback } from 'react';
import { toHex } from 'viem';

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
      const rootEvmAddress32 = toSubstrateBytes32Address(context.rootAddress);
      const nominatorEvmAddress32 = toSubstrateBytes32Address(
        context.nominatorAddress,
      );
      const bouncerEvmAddress32 = toSubstrateBytes32Address(
        context.bouncerAddress,
      );

      return {
        functionName: 'create',
        arguments: [
          context.initialBondAmount,
          rootEvmAddress32,
          nominatorEvmAddress32,
          bouncerEvmAddress32,
          // Strings are NOT automatically encoded to bytes in Viem.
          // Manually convert them to hex here.
          toHex(context.name ?? ''),
          toHex(context.iconUrl ?? ''),
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
