import { decodeAddress, encodeAddress } from '@polkadot/keyring';

export const isValidAddress = (target: string): boolean => {
  try {
    encodeAddress(decodeAddress(target));
  } catch (e) {
    return false;
  }

  return true;
};
