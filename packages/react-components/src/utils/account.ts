import { encodeAddress, decodeAddress } from '@polkadot/keyring';

export const isValidateAddress = (target: string): boolean => {
  try {
    encodeAddress(decodeAddress(target));
  } catch (e) {
    return false;
  }

  return true;
};
