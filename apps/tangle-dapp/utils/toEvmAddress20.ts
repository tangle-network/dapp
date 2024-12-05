import { u8aToHex } from '@polkadot/util';
import { addressToEvm } from '@polkadot/util-crypto';
import assert from 'assert';
import { Address } from 'viem';

import { isEvmAddress } from './isEvmAddress';
import isSubstrateAddress from './isSubstrateAddress';

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
 * @param substrateAddress - The address to be converted, which can be either a Substrate
 * or an EVM address.
 * @returns The converted EVM address. If the address is already an EVM address,
 * it will be returned as is.
 */
export const toEvmAddress20 = (substrateAddress: string): Address => {
  if (!isSubstrateAddress(substrateAddress)) {
    throw new Error('Provided address is not a Substrate address');
  }

  // EVM addresses are 20 bytes (160 bits) long.
  const conversionResult = u8aToHex(addressToEvm(substrateAddress), 160);

  assert(
    isEvmAddress(conversionResult),
    `Conversion to EVM address should not fail when a valid Substrate address is provided, got: ${conversionResult}`,
  );

  return conversionResult;
};