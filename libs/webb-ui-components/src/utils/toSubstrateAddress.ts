import { encodeAddress, evmToAddress } from '@polkadot/util-crypto';

import { AnyAddress, SubstrateAddress } from '../types/address';
import assertSubstrateAddress from './assertSubstrateAddress';
import { isEvmAddress } from './isEvmAddress';

/**
 * Converts an EVM address to a Substrate address.
 *
 * @remarks
 * If the address is neither an Ethereum nor a Substrate address,
 * an error will be thrown.
 *
 * **Important note**: EVM and Substrate address conversion is one-way,
 * and not inverses. This means that if you convert a Substrate address
 * to an EVM address, you cannot convert it back to the **same** Substrate address.
 *
 * @param address - The address to be converted, which can be either a Substrate
 * or an EVM address.
 * @returns The converted Substrate address. If the address is already a
 * Substrate address, it will be returned as is.
 */
export const toSubstrateAddress = (
  address: AnyAddress,
  ss58Format?: number,
): SubstrateAddress => {
  // If it's an EVM address, convert it to a Substrate address.
  if (isEvmAddress(address)) {
    // Different SS58 formats can be used for different networks,
    // which still represents the same account, but look different.
    return assertSubstrateAddress(evmToAddress(address, ss58Format));
  }
  // Otherwise, it must be a Substrate address.
  else {
    // Process the address with the given SS58 format, in
    // case that the SS58 format given differs from that of the
    // address.
    return assertSubstrateAddress(encodeAddress(address, ss58Format));
  }
};
