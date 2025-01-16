import { BN } from '@polkadot/util';
import { toSubstrateAddress } from '@webb-tools/webb-ui-components';
import { AnyAddress } from '@webb-tools/webb-ui-components/types/address';
import toSubstrateBytes32Address from '@webb-tools/webb-ui-components/utils/toSubstrateBytes32Address';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '../../../abi/lst';

type Context = {
  name?: string;
  iconUrl?: string;
  initialBondAmount: BN;
  rootAddress: AnyAddress;
  nominatorAddress: AnyAddress;
  bouncerAddress: AnyAddress;
};

const useLsCreatePoolTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, context) => {
      return api.tx.lst.create(
        context.initialBondAmount,
        toSubstrateAddress(context.rootAddress),
        toSubstrateAddress(context.nominatorAddress),
        toSubstrateAddress(context.bouncerAddress),
        context.name ?? null,
        context.iconUrl ?? null,
      );
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<
    typeof LST_PRECOMPILE_ABI,
    'create',
    Context
  > = useCallback((context) => {
    const rootEvmAddress32 = toSubstrateBytes32Address(context.rootAddress);

    const nominatorEvmAddress32 = toSubstrateBytes32Address(
      context.nominatorAddress,
    );

    const bouncerEvmAddress32 = toSubstrateBytes32Address(
      context.bouncerAddress,
    );

    // Use TextEncoder to handle non-ASCII characters.
    const encoder = new TextEncoder();

    const name = context.name ?? '';
    const iconUrl = context.iconUrl ?? '';
    const nameArray = Array.from(encoder.encode(name));
    const iconUrlArray = Array.from(encoder.encode(iconUrl));

    return {
      functionName: 'create',
      arguments: [
        BigInt(context.initialBondAmount.toString()),
        rootEvmAddress32,
        nominatorEvmAddress32,
        bouncerEvmAddress32,
        nameArray,
        iconUrlArray,
      ],
    };
  }, []);

  return useAgnosticTx({
    name: TxName.LS_TANGLE_POOL_CREATE,
    abi: LST_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsCreatePoolTx;
