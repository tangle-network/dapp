import CALL_PERMIT_PRECOMPILE_ABI from '../abi/callPermit';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useContractRead from '../data/evm/useContractRead';
import { PrecompileAddress } from '../constants/evmPrecompiles';
import { assertEvmAddress } from '@tangle-network/webb-ui-components';
import { useCallback } from 'react';

const useEvmCallPermitNonce = (): bigint | null => {
  const { evmAddress } = useAgnosticAccountInfo();

  const { data: nonce } = useContractRead(
    CALL_PERMIT_PRECOMPILE_ABI,
    useCallback(() => {
      if (evmAddress === null) {
        return null;
      }

      return {
        address: assertEvmAddress(PrecompileAddress.CALL_PERMIT),
        functionName: 'nonces',
        args: [evmAddress],
      } as const;
    }, [evmAddress]),
  );

  // TODO: Handle error case explicitly.
  return nonce instanceof Error ? null : (nonce ?? null);
};

export default useEvmCallPermitNonce;
