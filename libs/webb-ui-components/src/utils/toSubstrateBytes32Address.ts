import { decodeAddress } from '@polkadot/util-crypto';
import { SubstrateBytes32Address, AnyAddress } from '../types/address';
import { isSubstrateAddress } from './isSubstrateAddress';
import { u8aToHex } from '@polkadot/util';
import assert from 'assert';
import { isEvmAddress } from './isEvmAddress20';
import { toSubstrateAddress } from './toSubstrateAddress';

/**
 * Certain precompile functions require `bytes32` addresses instead
 * of the usual 20-byte `address` type.
 */
const toSubstrateBytes32Address = (
  address: AnyAddress,
): SubstrateBytes32Address => {
  if (isEvmAddress(address)) {
    return toSubstrateBytes32Address(toSubstrateAddress(address));
  } else if (!isSubstrateAddress(address)) {
    return address;
  }

  const result = u8aToHex(decodeAddress(address));

  assert(result.length === 66, 'Result should be a 32 bytes address');

  return result as SubstrateBytes32Address;
};

export default toSubstrateBytes32Address;
