import {
  assertBytes32,
  toSubstrateAddress,
} from '@tangle-network/ui-components';
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

export type Context = {
  poolId: number;
  rootAddress?: AnyAddress;
  nominatorAddress?: AnyAddress;
  bouncerAddress?: AnyAddress;
};

// The precompile logic will interpret the 32-byte zero address as a no-op.
const PRECOMPILE_NOOP_ADDRESS = assertBytes32(
  '0x0000000000000000000000000000000000000000000000000000000000000000',
);

const useLsUpdateRolesTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, _activeSubstrateAddress, context) => {
      const noop = { Noop: null };

      const rootAddress =
        context.rootAddress === undefined
          ? noop
          : { Set: toSubstrateAddress(context.rootAddress) };

      const nominatorAddress =
        context.nominatorAddress === undefined
          ? noop
          : { Set: toSubstrateAddress(context.nominatorAddress) };

      const bouncerAddress =
        context.bouncerAddress === undefined
          ? noop
          : { Set: toSubstrateAddress(context.bouncerAddress) };

      return api.tx.lst.updateRoles(
        context.poolId,
        rootAddress,
        nominatorAddress,
        bouncerAddress,
      );
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<
    typeof LST_PRECOMPILE_ABI,
    'updateRoles',
    Context
  > = useCallback((context) => {
    if (
      context.rootAddress === undefined &&
      context.nominatorAddress === undefined &&
      context.bouncerAddress === undefined
    ) {
      throw new Error('At least one address change must occur');
    }

    const rootEvmAddress32 =
      context.rootAddress === undefined
        ? PRECOMPILE_NOOP_ADDRESS
        : convertAddressToBytes32(context.rootAddress);

    const nominatorEvmAddress32 =
      context.nominatorAddress === undefined
        ? PRECOMPILE_NOOP_ADDRESS
        : convertAddressToBytes32(context.nominatorAddress);

    const bouncerEvmAddress32 =
      context.bouncerAddress === undefined
        ? PRECOMPILE_NOOP_ADDRESS
        : convertAddressToBytes32(context.bouncerAddress);

    return {
      functionName: 'updateRoles',
      arguments: [
        context.poolId,
        rootEvmAddress32,
        nominatorEvmAddress32,
        bouncerEvmAddress32,
      ],
    };
  }, []);

  return useAgnosticTx({
    name: TxName.LS_TANGLE_POOL_UPDATE_ROLES,
    abi: LST_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.LST,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useLsUpdateRolesTx;
