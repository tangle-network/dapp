import {
  encodeAddress,
  evmToAddress,
  isEthereumAddress,
} from '@polkadot/util-crypto';
import assert from 'assert';

import { SubstrateAddress } from '../types/utils';
import assertSubstrateAddress from './assertSubstrateAddress';
import isSubstrateAddress2 from './isSubstrateAddress2';

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
  address: string,
  ss58Format?: number,
): SubstrateAddress => {
  // If it's an EVM address, convert it to a Substrate address.
  if (isEthereumAddress(address)) {
    // Different SS58 formats can be used for different networks,
    // which still represents the same account, but look different.
    return assertSubstrateAddress(evmToAddress(address, ss58Format));
  }

  // Otherwise, it must be a valid Substrate address.
  assert(
    isSubstrateAddress2(address),
    'Address that is neither an EVM nor a Substrate address was provided (did you forget to validate an input address from the user?)',
  );

  // Process the address with the given SS58 format, in
  // case that the SS58 format given differs from that of the
  // address.
  return assertSubstrateAddress(encodeAddress(address, ss58Format));
};
