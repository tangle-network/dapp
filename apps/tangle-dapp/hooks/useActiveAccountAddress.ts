import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  isEvmAddress32,
  isSubstrateAddress,
  toSubstrateAddress,
} from '@webb-tools/webb-ui-components';
import {
  EvmAddress32,
  SubstrateAddress,
} from '@webb-tools/webb-ui-components/types/address';
import assert from 'assert';

const useActiveAccountAddress = (): SubstrateAddress | EvmAddress32 | null => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();

  const address = activeAccount?.address;

  if (address === undefined) {
    return null;
  }

  assert(isEvmAddress32(address) || isSubstrateAddress(address));

  // Encode it with the correct SS58 prefix in case that it is a
  // Substrate address.
  return network.ss58Prefix !== undefined && isSubstrateAddress(address)
    ? toSubstrateAddress(address, network.ss58Prefix)
    : address;
};

export default useActiveAccountAddress;
