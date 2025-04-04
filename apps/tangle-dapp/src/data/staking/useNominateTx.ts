import { toSubstrateAddress } from '@tangle-network/ui-components';
import { AnyAddress } from '@tangle-network/ui-components/types/address';
import convertAddressToBytes32 from '@tangle-network/ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '@tangle-network/tangle-shared-ui/constants/evmPrecompiles';
import useAgnosticTx from '@tangle-network/tangle-shared-ui/hooks/useAgnosticTx';
import { EvmTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import STAKING_PRECOMPILE_ABI from '@tangle-network/tangle-shared-ui/abi/staking';
import { SUCCESS_MESSAGES } from '../../hooks/useTxNotification';

type Context = {
  validatorAddresses: AnyAddress[];
};

const useNominateTx = () => {
  const evmTxFactory: EvmTxFactory<
    typeof STAKING_PRECOMPILE_ABI,
    'nominate',
    Context
  > = useCallback((context) => {
    if (context.validatorAddresses.length === 0) {
      return null;
    }

    // Ensure that all addresses are expected format.
    // The nominate precompile function expects 32-byte addresses.
    const evmAddresses32 = context.validatorAddresses.map(
      convertAddressToBytes32,
    );

    return { functionName: 'nominate', arguments: [evmAddresses32] };
  }, []);

  const substrateTxFactory: SubstrateTxFactory<Context> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      if (context.validatorAddresses.length === 0) {
        return null;
      }

      // Ensure that all addresses are in Substrate format.
      const substrateAddresses =
        context.validatorAddresses.map(toSubstrateAddress);

      return api.tx.staking.nominate(substrateAddresses);
    },
    [],
  );

  return useAgnosticTx({
    name: TxName.NOMINATE,
    abi: STAKING_PRECOMPILE_ABI,
    precompileAddress: PrecompileAddress.STAKING,
    evmTxFactory,
    substrateTxFactory,
    successMessageByTxName: SUCCESS_MESSAGES,
  });
};

export default useNominateTx;
