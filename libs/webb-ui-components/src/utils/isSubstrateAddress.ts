import { isAddress } from '@polkadot/util-crypto';
import { SubstrateAddress } from '../types/address';

export const isSubstrateAddress = (
  address: string,
): address is SubstrateAddress => {
  return isAddress(address);
};
