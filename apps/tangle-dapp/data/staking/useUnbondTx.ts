import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFunctionType } from '../../types';

type UnbondTxContext = {
  amount: BN;
};

const useUnbondTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<Precompile.STAKING, UnbondTxContext> =
    useCallback(
      (context) => ({ functionName: 'unbond', arguments: [context.amount] }),
      [],
    );

  const substrateTxFactory: SubstrateTxFactory<UnbondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.staking.unbond(context.amount),
    [],
  );

  const getSuccessMessageFnc: GetSuccessMessageFunctionType<UnbondTxContext> =
    useCallback(
      ({ amount }) =>
        `Successfully unstaked ${formatNativeTokenAmount(amount)}.`,
      [formatNativeTokenAmount],
    );

  return useAgnosticTx<Precompile.STAKING, UnbondTxContext>({
    name: TxName.UNBOND,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessageFnc,
  });
};

export default useUnbondTx;
