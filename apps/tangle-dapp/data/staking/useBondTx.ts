import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { StakingPayee } from '../../types';

type BondTxContext = {
  amount: BN;
  payee: StakingPayee;
};

export function getPayeeValue(
  paymentDestination: StakingPayee,
  isEvm: boolean
) {
  if (isEvm) {
    switch (paymentDestination) {
      case StakingPayee.CONTROLLER:
        return '0x0000000000000000000000000000000000000000000000000000000000000002';
      case StakingPayee.STAKED:
        return '0x0000000000000000000000000000000000000000000000000000000000000000';
      case StakingPayee.STASH:
        return '0x0000000000000000000000000000000000000000000000000000000000000001';
    }
  }

  switch (paymentDestination) {
    case StakingPayee.CONTROLLER:
      return 'Controller';
    case StakingPayee.STAKED:
      return 'Staked';
    case StakingPayee.STASH:
      return 'Stash';
  }
}

const useBondTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, BondTxContext> =
    useCallback((context) => {
      const payee = getPayeeValue(context.payee, true);

      return { functionName: 'bond', arguments: [context.amount, payee] };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<BondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const payee = getPayeeValue(context.payee, false);

      return api.tx.staking.bond(context.amount, payee);
    },
    []
  );

  return useAgnosticTx<Precompile.STAKING, BondTxContext>({
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useBondTx;
