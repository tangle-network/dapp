import { BN } from '@polkadot/util';
import { toSubstrateAddress } from '@tangle-network/webb-ui-components';
import { AnyAddress } from '@tangle-network/webb-ui-components/types/address';
import convertAddressToBytes32 from '@tangle-network/webb-ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileCall';
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
    const rootEvmAddress32 = convertAddressToBytes32(context.rootAddress);

    const nominatorEvmAddress32 = convertAddressToBytes32(
      context.nominatorAddress,
    );

    const bouncerEvmAddress32 = convertAddressToBytes32(context.bouncerAddress);

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
