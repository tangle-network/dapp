import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/util-crypto';
import { Address } from 'viem';

import isSubstrateAddress from './isSubstrateAddress';

/**
 * An EVM address that is 32 bytes long.
 *
 * Certain precompile functions require `bytes32` addresses instead
 * of the usual 20-byte `address` type.
 */
const toEvmAddress32 = (substrateAddress: string): Address => {
  if (!isSubstrateAddress(substrateAddress)) {
    throw new Error('Provided address is not a Substrate address');
  }

  return u8aToHex(decodeAddress(substrateAddress));
};

export default toEvmAddress32;
