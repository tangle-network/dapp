import { addressToEvm, isAddress } from '@polkadot/util-crypto';
import { AddressType } from '@webb-tools/dapp-config/types';
import { toHex } from '@webb-tools/utils';
import assert from 'assert';

import { isEvmAddress } from './isEvmAddress';

/**
 * Converts a Substrate address to an EVM address.
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
 * @returns The converted EVM address. If the address is already an EVM address,
 * it will be returned as is.
 */
export const substrateToEvmAddress = (address: string): AddressType => {
  // TODO: This isn't actually returning the correct Substrate address type.

  assert(
    isEvmAddress(address) || isAddress(address),
    'Address that is neither an EVM nor a Substrate address was provided (did you forget to validate an input address from the user?)'
  );

  // Nothing to do if it's already an EVM address.
  if (isEvmAddress(address)) {
    return address;
  }

  // EVM addresses are 20 bytes long.
  const conversionResult = toHex(addressToEvm(address), 20);

  assert(
    isEvmAddress(conversionResult),
    'Conversion to EVM address should not fail when a valid Substrate address is provided'
  );

  return conversionResult;
};
