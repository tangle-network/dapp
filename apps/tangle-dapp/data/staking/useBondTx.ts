import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { StakingRewardsDestination } from '../../types';
import getEvmPayeeValue from '../../utils/staking/getEvmPayeeValue';
import getSubstratePayeeValue from '../../utils/staking/getSubstratePayeeValue';

type BondTxContext = {
  amount: BN;
  payee: StakingRewardsDestination;
};

const useBondTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, BondTxContext> =
    useCallback((context) => {
      const payee = getEvmPayeeValue(context.payee);

      // TODO: Are we missing adding all the EVM addresses for the other reward destinations?
      if (payee === null) {
        throw new Error(
          "Requested payee doesn't have a corresponding EVM address registered"
        );
      }

      return { functionName: 'bond', arguments: [context.amount, payee] };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<BondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const payee = getSubstratePayeeValue(context.payee);

      return api.tx.staking.bond(context.amount, payee);
    },
    []
  );

  return useAgnosticTx<Precompile.STAKING, BondTxContext>({
    name: TxName.BOND,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useBondTx;
