import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import LST_PRECOMPILE_ABI from '../../abi/lst';
import { convertAddressToBytes32 } from '@webb-tools/webb-ui-components';

type Context = {
  poolId: number;
  slashingSpans: number;
};

const useLsWithdrawUnbondedTx = () => {
  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    async (api, activeSubstrateAddress, context) => {
      return api.tx.lst.withdrawUnbonded(
        activeSubstrateAddress,
        context.poolId,
        context.slashingSpans,
      );
    },
    [],
  );

  const evmTxFactory: EvmTxFactory<
    typeof LST_PRECOMPILE_ABI,
    'withdrawUnbonded',
    Context
  > = useCallback((context, activeEvmAddress20) => {
    return {
      functionName: 'withdrawUnbonded',
      arguments: [
        convertAddressToBytes32(activeEvmAddress20),
        context.poolId,
        context.slashingSpans,
      ],
    };
  }, []);

  return useAgnosticTx({
    name: TxName.LS_WITHDRAW_UNBONDED,
    abi: LST_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.LST,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useLsWithdrawUnbondedTx;
