import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import assert from 'assert';

import evmAddress20To32 from './evmAddress20To32';
import { isEvmAddress20 } from './isEvmAddress20';
import { isEvmAddress32 } from './isEvmAddress32';
import { AnyAddress, EvmAddress32 } from '../types/address';

/**
 * An EVM address that is 32 bytes long.
 *
 * Certain precompile functions require `bytes32` addresses instead
 * of the usual 20-byte `address` type.
 */
const toEvmAddress32 = (address: AnyAddress): EvmAddress32 => {
  if (isEvmAddress32(address)) {
    return address;
  } else if (isEvmAddress20(address)) {
    return evmAddress20To32(address);
  }

  const result = u8aToHex(decodeAddress(address));

  assert(isEvmAddress32(result));

  return result;
};

export default toEvmAddress32;
