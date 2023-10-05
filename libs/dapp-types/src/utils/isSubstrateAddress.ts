import { decodeAddress, encodeAddress } from '@polkadot/keyring';

function isSubstrateAddress(address: string): boolean {
  const maybeSS58 = !address.startsWith('0x');
  const maybeDecodedAddress = address.replace('0x', '').length === 64;

  if (maybeSS58) {
    try {
      encodeAddress(decodeAddress(address));
      return true;
    } catch {
      return false;
    }
  }

  if (maybeDecodedAddress) {
    try {
      encodeAddress(address);
      return true;
    } catch (e) {
      return false;
    }
  }

  return false;
}

export default isSubstrateAddress;
