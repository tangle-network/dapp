import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFunction } from '../../types';
import useSlashingSpans from './useSlashingSpans';

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

  const evmTxFactory: EvmTxFactory<Precompile.STAKING> = useCallback(() => {
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

  const getSuccessMessageFnc: GetSuccessMessageFunction<void> = useCallback(
    () =>
      withdrawAmount
        ? `Successfully withdrew ${formatNativeTokenAmount(withdrawAmount)}.`
        : '',
    [withdrawAmount, formatNativeTokenAmount],
  );

  return useAgnosticTx<Precompile.STAKING>({
    name: TxName.WITHDRAW_UNBONDED,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessageFnc,
  });
};

export default useWithdrawUnbondedTx;
