import assert from 'assert';
import { EvmAddress } from '../types/address';
import { isEvmAddress } from './isEvmAddress20';
import { checksumAddress } from 'viem';

export const assertEvmAddress = (address: string): EvmAddress => {
  assert(
    isEvmAddress(address),
    `Address should be a valid EVM address, but got ${address}`,
  );

  // Normalize the address to checksum format. This helps with
  // consistency and possible issues when comparing addresses.
  return checksumAddress(address) as EvmAddress;
};
