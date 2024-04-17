import { useCallback } from 'react';
import { padHex } from 'viem';

import { TxName } from '../../constants';
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

      // Pad the address to 32 bytes, since the function expects a 32-byte
      // address.
      const validatorEvmAddress32 = padHex(validatorEvmAddress, {
        size: 32,
      });

      return {
        functionName: 'payoutStakers',
        arguments: [validatorEvmAddress32, context.era],
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
    name: TxName.PAYOUT_STAKERS,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default usePayoutStakersTx;
