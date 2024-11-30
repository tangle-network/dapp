import { AnyAddress } from '@webb-tools/webb-ui-components/types/address';
import toEvmAddress32 from '@webb-tools/webb-ui-components/utils/toEvmAddress32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { toSubstrateAddress } from '../../utils';

export type PayoutStakersTxContext = {
  validatorAddress: AnyAddress;
  era: number;
};

const usePayoutStakersTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, PayoutStakersTxContext> =
    useCallback((context) => {
      // The payout stakers precompile function expects a 32-byte address.
      const validatorEvmAddress32 = toEvmAddress32(context.validatorAddress);

      return {
        functionName: 'payoutStakers',
        arguments: [validatorEvmAddress32, context.era],
      };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<PayoutStakersTxContext> =
    useCallback((api, _activeSubstrateAddress, context) => {
      const validatorSubstrateAddress = toSubstrateAddress(
        context.validatorAddress,
      );

      return api.tx.staking.payoutStakers(
        validatorSubstrateAddress,
        context.era,
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
