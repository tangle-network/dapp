import { toSubstrateAddress } from '@tangle-network/ui-components';
import { AnyAddress } from '@tangle-network/ui-components/types/address';
import convertAddressToBytes32 from '@tangle-network/ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import STAKING_PRECOMPILE_ABI from '../../abi/staking';

type Context = {
  validatorAddress: AnyAddress;
  era: number;
};

const usePayoutStakersTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof STAKING_PRECOMPILE_ABI,
    'payoutStakers',
    Context
  > = useCallback((context) => {
    // The payout stakers precompile function expects a 32-byte address.
    const validatorEvmAddress32 = convertAddressToBytes32(
      context.validatorAddress,
    );

    return {
      functionName: 'payoutStakers',
      arguments: [validatorEvmAddress32, context.era],
    };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      const validatorSubstrateAddress = toSubstrateAddress(
        context.validatorAddress,
      );

      return api.tx.staking.payoutStakers(
        validatorSubstrateAddress,
        context.era,
      );
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.PAYOUT_STAKERS,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default usePayoutStakersTx;
