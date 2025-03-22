import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';

type Context = {
  amount: BN;
};

const useUnbondTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<
    typeof STAKING_PRECOMPILE_ABI,
    'unbond',
    Context
  > = useCallback(
    (context) => ({
      functionName: 'unbond',
      arguments: [BigInt(context.amount.toString())],
    }),
    [],
  );

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) =>
      api.tx.staking.unbond(context.amount),
    [],
  );

  const getSuccessMessage: GetSuccessMessageFn<Context> = useCallback(
    ({ amount }) => `Successfully unstaked ${formatNativeTokenAmount(amount)}.`,
    [formatNativeTokenAmount],
  );

  return useAgnosticTx({
    name: TxName.UNBOND,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
  });
};

export default useUnbondTx;
