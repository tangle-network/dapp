import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { evmToSubstrateAddress, substrateToEvmAddress } from '../../utils';

export type PayoutStakersTxContext = {
  validatorAddress: string;
  era: number;
};

const usePayoutStakersTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, PayoutStakersTxContext> =
    useCallback((context) => {
      const validatorEvmAddress = substrateToEvmAddress(
        context.validatorAddress
      );

      return {
        functionName: 'payoutStakers',
        arguments: [validatorEvmAddress, context.era],
      };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<PayoutStakersTxContext> =
    useCallback((api, _activeSubstrateAddress, context) => {
      const validatorSubstrateAddress = evmToSubstrateAddress(
        context.validatorAddress
      );

      return api.tx.staking.payoutStakers(
        validatorSubstrateAddress,
        context.era
      );
    }, []);

  return useAgnosticTx<Precompile.STAKING, PayoutStakersTxContext>({
    name: 'payout stakers',
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default usePayoutStakersTx;
