import { useCallback } from 'react';

import { TxName } from '../../constants';
import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { toSubstrateAddress } from '../../utils';
import toEvmAddress32 from '../../utils/toEvmAddress32';

type NominateTxContext = {
  validatorAddresses: string[];
};

const useNominateTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, NominateTxContext> =
    useCallback((context) => {
      if (context.validatorAddresses.length === 0) {
        return null;
      }

      // Ensure that all addresses are expected format.
      // The nominate precompile function expects 32-byte addresses.
      const evmAddresses32 = context.validatorAddresses.map(toEvmAddress32);

      return { functionName: 'nominate', arguments: [evmAddresses32] };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<NominateTxContext> = useCallback(
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

  return useAgnosticTx<Precompile.STAKING, NominateTxContext>({
    name: TxName.NOMINATE,
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useNominateTx;
