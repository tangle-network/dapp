import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

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
      // Args are now type checked against the abi def. for the function,
      // whereas before it was just 'unknown[]', so any type of arg could be passed. Now, it will throw an error if the arg type is incorrect.
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
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useBondExtraTx;
