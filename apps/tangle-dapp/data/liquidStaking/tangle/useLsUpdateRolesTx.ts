import { toSubstrateAddress } from '@webb-tools/webb-ui-components';
import { AnyAddress } from '@webb-tools/webb-ui-components/types/address';
import toEvmAddress32 from '@webb-tools/webb-ui-components/utils/toEvmAddress32';
import { useCallback } from 'react';

import { TxName } from '../../../constants';
import { Precompile } from '../../../constants/evmPrecompiles';
import useAgnosticTx from '../../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../../hooks/useSubstrateTx';

export type LsUpdateRolesTxContext = {
  poolId: number;
  rootAddress?: AnyAddress;
  nominatorAddress?: AnyAddress;
  bouncerAddress?: AnyAddress;
};

// The precompile logic will interpret the 32-byte zero address as a no-op.
const PRECOMPILE_NOOP_ADDRESS =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

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
          : toEvmAddress32(context.rootAddress);

      const nominatorEvmAddress32 =
        context.nominatorAddress === undefined
          ? PRECOMPILE_NOOP_ADDRESS
          : toEvmAddress32(context.nominatorAddress);

      const bouncerEvmAddress32 =
        context.bouncerAddress === undefined
          ? PRECOMPILE_NOOP_ADDRESS
          : toEvmAddress32(context.bouncerAddress);

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

  return useAgnosticTx<Precompile.LST, LsUpdateRolesTxContext>({
    name: TxName.LS_TANGLE_POOL_UPDATE_ROLES,
    precompile: Precompile.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsUpdateRolesTx;
