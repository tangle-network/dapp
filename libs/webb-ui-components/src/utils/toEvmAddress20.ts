import { addressToEvm } from '@polkadot/util-crypto';
import { toHex } from '@webb-tools/sdk-core';
import assert from 'assert';
import { EvmAddress20, SubstrateAddress } from '../types/address';
import { isEvmAddress20 } from './isEvmAddress20';

/**
 * Converts a Substrate address to a standard EVM address of 20 bytes.
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
export const toEvmAddress20 = (
  address: SubstrateAddress | EvmAddress20,
): EvmAddress20 => {
  // Nothing to do. Have this option for convenience.
  if (isEvmAddress20(address)) {
    return address;
  }

  // EVM addresses are 20 bytes long.
  const result = toHex(addressToEvm(address), 20);

  assert(
    isEvmAddress20(result),
    `Conversion to EVM address should not fail when a valid Substrate address is provided, got: ${result}`,
  );

  return result;
};
