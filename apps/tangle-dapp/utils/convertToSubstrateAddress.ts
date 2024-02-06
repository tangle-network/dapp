import {
  encodeAddress,
  evmToAddress,
  isEthereumAddress,
} from '@polkadot/util-crypto';

/**
 * Converts an Ethereum address to a Substrate address.
 *
 * @param address - The address to be converted.
 * @param substratePrefix - The SS58 prefix for the Substrate network.
 * @returns The converted Substrate address
 */
export const convertToSubstrateAddress = (
  address: string,
  substratePrefix?: number
): string => {
  if (isEthereumAddress(address)) {
    return evmToAddress(address, substratePrefix);
  }
  // if Substrate Address, encode it
  return encodeAddress(address, substratePrefix);
};
