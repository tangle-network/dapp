import assert from 'assert';
import { EvmAddress } from '../types/address';
import { isEvmAddress } from './isEvmAddress20';

export const assertEvmAddress = (address: string): EvmAddress => {
  assert(
    isEvmAddress(address),
    `Address should be a valid EVM address, but got ${address}`,
  );

  return address as EvmAddress;
};
