import { toSubstrateAddress } from '@tangle-network/webb-ui-components';
import { AnyAddress } from '@tangle-network/webb-ui-components/types/address';
import convertAddressToBytes32 from '@tangle-network/webb-ui-components/utils/convertAddressToBytes32';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { PrecompileAddress } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import STAKING_PRECOMPILE_ABI from '../../abi/staking';

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
  });
};

export default useNominateTx;
