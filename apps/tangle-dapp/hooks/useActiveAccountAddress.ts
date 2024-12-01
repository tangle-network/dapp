import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { tryEncodeSubstrateAddress } from '@webb-tools/webb-ui-components';
import {
  EvmAddress32,
  SubstrateAddress,
} from '@webb-tools/webb-ui-components/types/address';

const useActiveAccountAddress = (): SubstrateAddress | EvmAddress32 | null => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();

  return tryEncodeSubstrateAddress(activeAccount?.address, network.ss58Prefix);
};

export default useActiveAccountAddress;
