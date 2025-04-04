import assert from 'assert';
import { SolanaAddress } from '../types/address';
import { isSolanaAddress } from './isSolanaAddress';

/**
 * Asserts that the given address is a valid Solana address.
 *
 * @param address - The address to validate.
 * @returns The address as a SolanaAddress type if valid.
 * @throws If the address is not a valid Solana address.
 */
const assertSolanaAddress = (address: string): SolanaAddress => {
  assert(isSolanaAddress(address), 'Address should be a valid Solana address');

  return address;
};

export default assertSolanaAddress;
