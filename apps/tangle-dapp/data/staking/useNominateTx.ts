import { useCallback } from 'react';

import { Precompile } from '../../constants/evmPrecompiles';
import useAgnosticTx from '../../hooks/useAgnosticTx';
import { EvmTxFactory } from '../../hooks/useEvmPrecompileAbiCall';
import { SubstrateTxFactory } from '../../hooks/useSubstrateTx';
import { evmToSubstrateAddress, substrateToEvmAddress } from '../../utils';

type NominateTxContext = {
  validatorAddresses: string[];
};

const useNominateTx = () => {
  const evmTxFactory: EvmTxFactory<Precompile.STAKING, NominateTxContext> =
    useCallback((context) => {
      if (context.validatorAddresses.length === 0) {
        return null;
      }

      // Ensure that all addresses are in H160, EVM format.
      const evmAddresses = context.validatorAddresses.map(
        substrateToEvmAddress
      );

      return { functionName: 'nominate', arguments: [evmAddresses] };
    }, []);

  const substrateTxFactory: SubstrateTxFactory<NominateTxContext> = useCallback(
    (api, _activeSubstrateAddress, context) => {
      if (context.validatorAddresses.length === 0) {
        return null;
      }

      // Ensure that all addresses are in Substrate format.
      const substrateAddresses = context.validatorAddresses.map(
        evmToSubstrateAddress
      );

      return api.tx.staking.nominate(substrateAddresses);
    },
    []
  );

  return useAgnosticTx<Precompile.STAKING, NominateTxContext>({
    precompile: Precompile.STAKING,
    evmTxFactory,
    substrateTxFactory,
  });
};

export default useNominateTx;
