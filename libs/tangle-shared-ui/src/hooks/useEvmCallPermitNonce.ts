import useAgnosticAccountInfo from './useAgnosticAccountInfo';
import { useReadContract } from 'wagmi';
import CALL_PERMIT_PRECOMPILE_ABI from '../abi/callPermit';
import { PrecompileAddress } from '../constants/evmPrecompiles';

const useEvmCallPermitNonce = () => {
  const { evmAddress } = useAgnosticAccountInfo();

  return useReadContract({
    abi: CALL_PERMIT_PRECOMPILE_ABI,
    address: PrecompileAddress.CALL_PERMIT,
    functionName: 'nonces',
    args: evmAddress !== null ? [evmAddress] : undefined,
    query: {
      enabled: evmAddress !== null,
    },
  });
};

export default useEvmCallPermitNonce;
