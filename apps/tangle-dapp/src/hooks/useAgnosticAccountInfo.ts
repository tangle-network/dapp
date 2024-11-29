import { isEvmAddress } from '../utils/isEvmAddress';
import useActiveAccountAddress from './useActiveAccountAddress';

const useAgnosticAccountInfo = () => {
  const activeAccountAddress = useActiveAccountAddress();

  const isEvm =
    activeAccountAddress === null ? null : isEvmAddress(activeAccountAddress);

  return {
    isEvm,
    substrateAddress: isEvm ? null : activeAccountAddress,
    evmAddress: isEvm ? activeAccountAddress : null,
  };
};

export default useAgnosticAccountInfo;
