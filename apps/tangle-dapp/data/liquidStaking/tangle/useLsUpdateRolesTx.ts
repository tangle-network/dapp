import { useCallback } from 'react';
import { Address } from 'viem';

import { TxName } from '../../../constants';
import { Precompile } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';
import { SubstrateAddress } from '../../../types/utils';
import { toSubstrateAddress } from '../../../utils';
import toEvmAddress32 from '../../../utils/toEvmAddress32';

export type LsUpdateRolesTxContext = {
  poolId: number;
  rootAddress?: Address | SubstrateAddress;
  nominatorAddress?: Address | SubstrateAddress;
  bouncerAddress?: Address | SubstrateAddress;
};

const useLsUpdateRolesTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsUpdateRolesTxContext> =
    useCallback(async (api, _activeSubstrateAddress, context) => {
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
    }, []);

  const evmTxFactory: EvmTxFactory<Precompile.LST, LsUpdateRolesTxContext> =
    useCallback((context) => {
      // TODO: This will fail if the address is an EVM address.
      const rootEvmAddress32 = toEvmAddress32(context.rootAddress);
      const nominatorEvmAddress32 = toEvmAddress32(context.nominatorAddress);
      const bouncerEvmAddress32 = toEvmAddress32(context.bouncerAddress);

      return {
        functionName: 'updateRoles',
        // TODO: What's going on with the pool name? It's not accepted by the precompile function it seems.
        arguments: [
          context.poolId,
          rootEvmAddress32,
          nominatorEvmAddress32,
          bouncerEvmAddress32,
        ],
      };
    }, []);

  return useAgnosticTx<Precompile.LST, LsUpdateRolesTxContext>({
    name: TxName.LS_TANGLE_POOL_UPDATE_ROLES,
    precompile: Precompile.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsUpdateRolesTx;
