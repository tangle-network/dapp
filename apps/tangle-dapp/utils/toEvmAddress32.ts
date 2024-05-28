import { u8aToHex } from '@polkadot/util';
import { decodeAddress, isAddress } from '@polkadot/util-crypto';
import { AddressType } from '@webb-tools/dapp-config/types';

/**
 * An EVM address that is 32 bytes long.
 *
 * Certain precompile functions require `bytes32` addresses instead
 * of the usual 20-byte `address` type.
 */
const toEvmAddress32 = (substrateAddress: string): AddressType => {
  if (!isAddress(substrateAddress)) {
    throw new Error('Provided address is not a Substrate address');
  }

  return u8aToHex(decodeAddress(substrateAddress));
};

export default toEvmAddress32;
