import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import STAKING_PRECOMPILE_ABI from '../../abi/staking';

type Context = {
  amount: BN;
};

const useBondExtraTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<
    typeof STAKING_PRECOMPILE_ABI,
    'bondExtra',
    Context
  > = useCallback(
    (context) => ({
      functionName: 'bondExtra',
      arguments: [BigInt(context.amount.toString())],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.staking.bondExtra(context.amount),
    [],
  );

  const getSuccessMessage: GetSuccessMessageFn<Context> = useCallback(
    ({ amount }) =>
      `Successfully added ${formatNativeTokenAmount(
        amount,
      )} to your existing stake.`,
    [formatNativeTokenAmount],
  );

  return useAgnosticTx({
    name: TxName.BOND_EXTRA,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
  });
};

export default useBondExtraTx;
