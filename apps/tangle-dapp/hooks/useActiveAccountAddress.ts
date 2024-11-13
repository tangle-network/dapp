import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import tryEncodeSubstrateAddress from '@webb-tools/webb-ui-components/utils/tryEncodeSubstrateAddress';

const useActiveAccountAddress = (): string | null => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();

  return tryEncodeSubstrateAddress(activeAccount?.address, network.ss58Prefix);
};

export default useActiveAccountAddress;
