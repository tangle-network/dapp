import { isEthereumAddress } from '@polkadot/util-crypto';

import useActiveAccountAddress from './useActiveAccountAddress';

const useAgnosticAccountInfo = () => {
  const activeAccountAddress = useActiveAccountAddress();

  const isEvm =
    activeAccountAddress === null
      ? null
      : isEthereumAddress(activeAccountAddress);

  return {
    isEvm,
    substrateAddress: isEvm ? null : activeAccountAddress,
    evmAddress: isEvm ? activeAccountAddress : null,
  };
};

export default useAgnosticAccountInfo;
