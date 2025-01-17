import { decodeAddress } from '@polkadot/util-crypto';
import { Bytes32, AnyAddress } from '../types/address';
import { isSubstrateAddress } from './isSubstrateAddress';
import { u8aToHex } from '@polkadot/util';
import { isEvmAddress } from './isEvmAddress20';
import { toSubstrateAddress } from './toSubstrateAddress';
import { assertBytes32 } from '.';

/**
 * Certain precompile functions require `bytes32` addresses instead
 * of the usual 20-byte `address` type.
 */
const convertAddressToBytes32 = (address: AnyAddress): Bytes32 => {
  if (isEvmAddress(address)) {
    return convertAddressToBytes32(toSubstrateAddress(address));
  } else if (!isSubstrateAddress(address)) {
    return address as Bytes32;
  }

  const result = u8aToHex(decodeAddress(address));

  return assertBytes32(result);
};

export default convertAddressToBytes32;
