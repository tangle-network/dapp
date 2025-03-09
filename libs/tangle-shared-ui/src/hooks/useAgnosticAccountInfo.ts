import { isSubstrateAddress } from '@tangle-network/ui-components';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import {
  EvmAddress,
  SolanaAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';

import useActiveAccountAddress from './useActiveAccountAddress';

type ReturnType = {
  isEvm: boolean | null;
  isSolana: boolean | null;
  substrateAddress: SubstrateAddress | null;
  evmAddress: EvmAddress | null;
  solanaAddress: SolanaAddress | null;
};

const useAgnosticAccountInfo = (): ReturnType => {
  const activeAccountAddress = useActiveAccountAddress();

  if (activeAccountAddress === null) {
    return {
      isEvm: null,
      isSolana: null,
      substrateAddress: null,
      evmAddress: null,
      solanaAddress: null,
    };
  }

  const isEvm = isEvmAddress(activeAccountAddress);
  const isSolana = isSolanaAddress(activeAccountAddress);
  const isSubstrate = isSubstrateAddress(activeAccountAddress);

  return {
    isEvm,
    isSolana,
    substrateAddress: isSubstrate ? activeAccountAddress : null,
    evmAddress: isEvm ? activeAccountAddress : null,
    solanaAddress: isSolana ? activeAccountAddress : null,
  };
};

export default useAgnosticAccountInfo;
