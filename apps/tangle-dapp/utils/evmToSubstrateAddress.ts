import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import assert from 'assert';

/**
 * Converts an EVM address to a Substrate address.
 *
 * @remarks
 * If the address is already a Substrate address, it will be
 * returned as is.
 *
 * If the address is neither an EVM nor a Substrate address,
 * an error will be thrown.
 *
 * @param address - The address to be converted.
 * @returns The converted Substrate address
 */
export const evmToSubstrateAddress = (address: string) => {
  // If it's an EVM address, convert it to a Substrate address.
  if (isEthereumAddress(address)) {
    return evmToAddress(address);
  }

  assert(
    isSubstrateAddress(address),
    'Address that is neither an EVM nor a Substrate address was provided (did you forget to validate an input address from the user?)'
  );

  return address;
};
