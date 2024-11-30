import assert from 'assert';

import { isEvmAddress } from './isEvmAddress';
import { isEvmAddress32 } from './isEvmAddress32';
import { EvmAddress20, EvmAddress32 } from '../types/address';

/**
 * Convert an EVM H160 address to an EVM H256 address (bytes32).
 *
 * This is done by padding the beginning of the address with 12
 * bytes of zeros.
 */
const evmAddress20To32 = (address: EvmAddress20): EvmAddress32 => {
  assert(isEvmAddress(address), 'Provided address should a valid EVM address');

  assert(
    address.length === 42,
    'Provided address should be 42 characters long (20 bytes)',
  );

  const result = `0x${'0'.repeat(24)}${address.slice(2)}`;

  assert(isEvmAddress32(result), 'Conversion to EVM address32 should not fail');

  return result;
};

export default evmAddress20To32;
