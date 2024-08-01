import { encodeAddress } from '@polkadot/util-crypto';
import { useActiveAccount } from '@webb-tools/api-provider-environment/WebbProvider/subjects';

import useNetworkStore from '../context/useNetworkStore';
import { isEvmAddress } from '../utils/isEvmAddress';

const useActiveAccountAddress = (): string | null => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();
  const activeAccountAddress = activeAccount?.address ?? null;

  // No active account, return null.
  if (activeAccountAddress === null) {
    return null;
  }
  // If the active account is an EVM address, return it as is.
  else if (isEvmAddress(activeAccountAddress)) {
    return activeAccountAddress;
  }
  // If the active network has an associated ss58 prefix, encode
  // the address using that ss58 prefix.
  else if (network.ss58Prefix !== undefined) {
    return encodeAddress(activeAccountAddress, network.ss58Prefix);
  }

  // Otherwise, return the address as is.
  return activeAccountAddress;
};

export default useActiveAccountAddress;
