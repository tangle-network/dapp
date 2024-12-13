import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { SubstrateAddress } from '../types/address';

export const isSubstrateAddress = (
  address: string,
): address is SubstrateAddress => {
  // It seems that `isAddress` returns true for EVM addresses.
  // Check also that it is NOT an EVM address to prevent bugs.
  return !isEthereumAddress(address) && isAddress(address);
};
