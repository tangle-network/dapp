import assert from 'assert';
import { AnyAddress, SolanaAddress } from '../types/address';

export const assertAddressBy = <T extends AnyAddress | SolanaAddress>(
  address: string,
  guard: (address: string) => address is T,
): T => {
  assert(
    guard(address),
    `Failed to assert that a string value was a valid address: ${address}`,
  );

  return address as T;
};
