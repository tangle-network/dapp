import { BN } from '@polkadot/util';
import { toSubstrateAddress } from '@tangle-network/ui-components';
import { AnyAddress } from '@tangle-network/ui-components/types/address';
import convertAddressToBytes32 from '@tangle-network/ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/lst';
import { SUCCESS_MESSAGES } from '../../../hooks/useTxNotification';

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
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useLsCreatePoolTx;
