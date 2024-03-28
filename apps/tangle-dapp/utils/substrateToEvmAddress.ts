import { addressToEvm, isAddress } from '@polkadot/util-crypto';
import { AddressType } from '@webb-tools/dapp-config/types';
import assert from 'assert';

import { isEvmAddress } from './isEvmAddress';

/**
 * Converts a Substrate address to an EVM address.
 *
 * @remarks
 * If the address is already an EVM address, it will be
 * returned as is.
 *
 * If the address is neither an Ethereum nor a Substrate address,
 * an error will be thrown.
 *
 * @param address - The address to be converted.
 * @returns The converted EVM address
 */
export const substrateToEvmAddress = (address: string): AddressType => {
  assert(
    isEvmAddress(address) || isAddress(address),
    'Address that is neither an EVM nor a Substrate address was provided (did you forget to validate an input address from the user?)'
  );

  // Nothing to do if it's already an EVM address.
  if (isEvmAddress(address)) {
    return address;
  }

  const conversionResult = addressToEvm(address).toString();

  assert(
    isEvmAddress(conversionResult),
    'Conversion to EVM address should not fail when a valid Substrate address is provided'
  );

  return conversionResult;
};
