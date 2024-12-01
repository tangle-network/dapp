import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import { isEvmAddress } from '../../../libs/webb-ui-components/src/utils/isEvmAddress';
import useActiveAccountAddress from './useActiveAccountAddress';
import { EvmAddress32 } from '../../../libs/webb-ui-components/src/types/address';
import { isSubstrateAddress } from '@webb-tools/webb-ui-components';

type ReturnType = {
  isEvm: boolean | null;
  substrateAddress: SubstrateAddress | null;
  evmAddress: EvmAddress32 | null;
};

const useAgnosticAccountInfo = (): ReturnType => {
  const activeAccountAddress = useActiveAccountAddress();

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
