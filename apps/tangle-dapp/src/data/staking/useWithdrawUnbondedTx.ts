import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFn } from '../../types';
import useSlashingSpans from './useSlashingSpans';
import STAKING_PRECOMPILE_ABI from '../../abi/staking';

const useWithdrawUnbondedTx = (withdrawAmount: BN | null) => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();
  const { result: slashingSpansOpt } = useSlashingSpans();

  // TODO: Need to verify whether defaulting to 0 here is the correct behavior.
  const slashingSpans =
    slashingSpansOpt === null
      ? null
      : slashingSpansOpt.isNone
        ? 0
        : // TODO: Need to verify that the span index is what is wanted by the extrinsics.
          slashingSpansOpt.unwrap().spanIndex.toNumber();

  const evmTxFactory: EvmTxFactory<
    typeof STAKING_PRECOMPILE_ABI,
    'withdrawUnbonded'
  > = useCallback(() => {
    if (slashingSpans === null) {
      return null;
    }

    return {
      functionName: 'withdrawUnbonded',
      arguments: [slashingSpans],
    };
  }, [slashingSpans]);

  const substrateTxFactory: SubstrateTxFactory = useCallback(
    (api) => {
      if (slashingSpans === null) {
        return null;
      }

      return api.tx.staking.withdrawUnbonded(slashingSpans);
    },
    [slashingSpans],
  );

  const getSuccessMessage: GetSuccessMessageFn<void> = useCallback(
    () =>
      withdrawAmount
        ? `Successfully withdrew ${formatNativeTokenAmount(withdrawAmount)}.`
        : '',
    [withdrawAmount, formatNativeTokenAmount],
  );

  return useAgnosticTx({
    name: TxName.WITHDRAW_UNBONDED,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessage,
  });
};

export default useWithdrawUnbondedTx;
