import { isSubstrateAddress } from '@webb-tools/webb-ui-components';
import {
  EvmAddress,
  SubstrateAddress,
} from '@webb-tools/webb-ui-components/types/address';

import useActiveAccountAddress from './useActiveAccountAddress';

type ReturnType = {
  isEvm: boolean | null;
  substrateAddress: SubstrateAddress | null;
  evmAddress: EvmAddress | null;
};

const useAgnosticAccountInfo = (): ReturnType => {
  const activeAccountAddress = useActiveAccountAddress();

  if (activeAccountAddress === null) {
    return {
      isEvm: null,
      substrateAddress: null,
      evmAddress: null,
    };
  }

  const isEvm = !isSubstrateAddress(activeAccountAddress);

  return {
    isEvm,
    substrateAddress: !isEvm ? activeAccountAddress : null,
    evmAddress: isEvm ? activeAccountAddress : null,
  };
};

export default useAgnosticAccountInfo;
