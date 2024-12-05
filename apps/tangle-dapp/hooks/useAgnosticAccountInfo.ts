import {
  isEvmAddress,
  isSubstrateAddress,
} from '@webb-tools/webb-ui-components';
import {
  EvmAddress32,
  SubstrateAddress,
} from '@webb-tools/webb-ui-components/types/address';

import useActiveAccountAddress from './useActiveAccountAddress';

type ReturnType = {
  isEvm: boolean | null;
  substrateAddress: SubstrateAddress | null;
  evmAddress: EvmAddress32 | null;
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

  const isEvm =
    activeAccountAddress === null ? null : isEvmAddress(activeAccountAddress);

  return {
    isEvm,
    substrateAddress: isSubstrateAddress(activeAccountAddress)
      ? activeAccountAddress
      : null,
    evmAddress: isEvmAddress(activeAccountAddress)
      ? activeAccountAddress
      : null,
  };
};

export default useAgnosticAccountInfo;
