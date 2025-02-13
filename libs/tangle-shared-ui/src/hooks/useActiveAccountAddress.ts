import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import {
  isEvmAddress,
  isSubstrateAddress,
  toSubstrateAddress,
} from '@tangle-network/webb-ui-components';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/webb-ui-components/types/address';
import assert from 'assert';
import useNetworkStore from '../context/useNetworkStore';

const useActiveAccountAddress = (): SubstrateAddress | EvmAddress | null => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();

  const address = activeAccount?.address;

  if (address === undefined) {
    return null;
  }

  assert(isEvmAddress(address) || isSubstrateAddress(address));

  // Encode it with the correct SS58 prefix in case that it is a
  // Substrate address.
  return network.ss58Prefix !== undefined && isSubstrateAddress(address)
    ? toSubstrateAddress(address, network.ss58Prefix)
    : address;
};

export default useActiveAccountAddress;
