import { BN } from '@polkadot/util';
import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { PaymentDestination } from '../../types';

type BondTxContext = {
  amount: BN;
  paymentDestination: PaymentDestination;
};

export function getPaymentDestinationPayee(
  paymentDestination: PaymentDestination,
  isEvm: boolean
) {
  if (isEvm) {
    switch (paymentDestination) {
      case PaymentDestination.CONTROLLER:
        return '0x0000000000000000000000000000000000000000000000000000000000000002';
      case PaymentDestination.STAKED:
        return '0x0000000000000000000000000000000000000000000000000000000000000000';
      case PaymentDestination.STASH:
        return '0x0000000000000000000000000000000000000000000000000000000000000001';
    }
  }

  switch (paymentDestination) {
    case PaymentDestination.CONTROLLER:
      return 'Controller';
    case PaymentDestination.STAKED:
      return 'Staked';
    case PaymentDestination.STASH:
      return 'Stash';
  }
}

const useBondTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, BondTxContext> =
    useCallback((context) => {
      const payee = getPaymentDestinationPayee(
        context.paymentDestination,
        true
      );

      return { functionName: 'bond', arguments: [context.amount, payee] };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<BondTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const payee = getPaymentDestinationPayee(
        context.paymentDestination,
        false
      );

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
