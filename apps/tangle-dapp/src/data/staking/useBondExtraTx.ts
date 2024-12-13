import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import useFormatNativeTokenAmount from '../../hooks/useFormatNativeTokenAmount';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { GetSuccessMessageFunction } from '../../types';

type BondExtraTxContext = {
  amount: BN;
};

const useBondExtraTx = () => {
  const formatNativeTokenAmount = useFormatNativeTokenAmount();

  const evmTxFactory: EvmTxFactory<Precompile.STAKING, BondExtraTxContext> =
    useCallback(
      (context) => ({ functionName: 'bondExtra', arguments: [context.amount] }),
      [],
    );

  const substrateTxFactory: SubstrateTxFactory<BondExtraTxContext> =
    useCallback(
      (api, _activeSubstrateAddress, context) =>
        api.tx.staking.bondExtra(context.amount),
      [],
    );

  const getSuccessMessageFnc: GetSuccessMessageFunction<BondExtraTxContext> =
    useCallback(
      ({ amount }) =>
        `Successfully added ${formatNativeTokenAmount(
          amount,
        )} to your existing stake.`,
      [formatNativeTokenAmount],
    );

  return useAgnosticTx<Precompile.STAKING, BondExtraTxContext>({
    name: TxName.BOND_EXTRA,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
    getSuccessMessageFnc,
  });
};

export default useBondExtraTx;
