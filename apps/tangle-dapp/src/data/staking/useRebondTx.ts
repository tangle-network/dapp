import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import STAKING_PRECOMPILE_ABI from '../../abi/staking';

type RebondTxContext = {
  amount: BN;
};

const useRebondTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<
    typeof STAKING_PRECOMPILE_ABI,
    'rebond',
    RebondTxContext
  > = useCallback(
    (context) => ({
      functionName: 'rebond',
      arguments: [BigInt(context.amount.toString())],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<RebondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.staking.rebond(context.amount),
    [],
  );

  const getSuccessMessage: GetSuccessMessageFn<RebondTxContext> = useCallback(
    ({ amount }) => `Successfully rebonded ${formatNativeTokenAmount(amount)}.`,
    [formatNativeTokenAmount],
  );

  return useAgnosticTx({
    name: TxName.REBOND,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
  });
};

export default useRebondTx;
