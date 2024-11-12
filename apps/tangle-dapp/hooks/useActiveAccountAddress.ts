import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import getDisplayAccountAddress from '@webb-tools/webb-ui-components/utils/getDisplayAccountAddress';

const useActiveAccountAddress = (): string | null => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();

  return getDisplayAccountAddress(activeAccount?.address, network.ss58Prefix);
};

export default useActiveAccountAddress;
