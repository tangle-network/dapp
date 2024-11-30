import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/precompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';

type LsWithdrawUnbondedTxContext = {
  poolId: number;
  slashingSpans: number;
};

const useLsWithdrawUnbondedTx = () => {
  const substrateTxFactory: SubstrateTxFactory<LsWithdrawUnbondedTxContext> =
    useCallback(async (api, activeSubstrateAddress, context) => {
      return api.tx.lst.withdrawUnbonded(
        activeSubstrateAddress,
        context.poolId,
        context.slashingSpans,
      );
    }, []);

  const evmTxFactory: EvmTxFactory<
    Precompile.LST,
    LsWithdrawUnbondedTxContext
  > = useCallback((context, activeEvmAddress20) => {
    // TODO: Convert to EVM address 32. The smart contract function expects EVM address 32 bytes.
    const activeEvmAddress32 = activeEvmAddress20;

    return {
      functionName: 'withdrawUnbonded',
      arguments: [activeEvmAddress32, context.poolId, context.slashingSpans],
    };
  }, []);

  return useAgnosticTx<Precompile.LST, LsWithdrawUnbondedTxContext>({
    name: TxName.LS_WITHDRAW_UNBONDED,
    precompile: Precompile.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsWithdrawUnbondedTx;
