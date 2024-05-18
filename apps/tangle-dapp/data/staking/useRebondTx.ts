import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx, {
  GetSuccessMessageFunctionType,
} from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';

type RebondTxContext = {
  amount: BN;
};

const useRebondTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<Precompile.STAKING, RebondTxContext> =
    useCallback(
      (context) => ({ functionName: 'rebond', arguments: [context.amount] }),
      []
    );

  const substrateTxFactory: SubstrateTxFactory<RebondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.staking.rebond(context.amount),
    []
  );

  const getSuccessMessageFnc: GetSuccessMessageFunctionType<RebondTxContext> =
    useCallback(
      ({ amount }) =>
        `Successfully rebonded ${formatNativeTokenAmount(amount)}.`,
      [formatNativeTokenAmount]
    );

  return useAgnosticTx<Precompile.STAKING, RebondTxContext>({
    name: TxName.REBOND,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessageFnc,
  });
};

export default useRebondTx;
