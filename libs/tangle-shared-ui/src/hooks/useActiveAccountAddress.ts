import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import {
  isEvmAddress,
  isSubstrateAddress,
  toSubstrateAddress,
} from '@tangle-network/ui-components';
import { isSolanaAddress } from '@tangle-network/ui-components/utils/isSolanaAddress';
import {
  EvmAddress,
  SolanaAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import useNetworkStore from '../context/useNetworkStore';

const useActiveAccountAddress = ():
  | SubstrateAddress
  | EvmAddress
  | SolanaAddress
  | null => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();

  const address = activeAccount?.address;

  if (address === undefined) {
    return null;
  }

  if (isSolanaAddress(address)) {
    return address;
  }

  if (isEvmAddress(address) || isSubstrateAddress(address)) {
    return network.ss58Prefix !== undefined && isSubstrateAddress(address)
      ? toSubstrateAddress(address, network.ss58Prefix)
      : address;
  }

  console.warn(`Unknown address type: ${address}`);
  return address as SubstrateAddress;
};

export default useActiveAccountAddress;
