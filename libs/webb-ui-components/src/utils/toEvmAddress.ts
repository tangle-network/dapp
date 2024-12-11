import { addressToEvm } from '@polkadot/util-crypto';
import assert from 'assert';
import { EvmAddress, SubstrateAddress } from '../types/address';
import { isEvmAddress } from './isEvmAddress20';
import { toHex } from 'viem';

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
 * @see https://docs.tangle.tools/developers/technicals/evm-substrate-transfers#convert-substrate-address-to-evm
 */
export const toEvmAddress = (
  address: SubstrateAddress | EvmAddress,
): EvmAddress => {
  // Nothing to do. Have this option for convenience.
  if (isEvmAddress(address)) {
    return address;
  }

  // Convert Substrate address to 32-byte account ID.
  const substrateAccountId = addressToEvm(address);

  // Truncate the first 20 bytes of the 32-byte account ID.
  const evmAddressBytes = substrateAccountId.subarray(0, 20);

  const evmAddress = toHex(evmAddressBytes);

  assert(
    isEvmAddress(evmAddress),
    `Conversion to EVM address should not fail when a valid Substrate address is provided, got: ${evmAddress}`,
  );

  return evmAddress;
};
