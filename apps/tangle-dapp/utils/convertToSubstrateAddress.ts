import {
  encodeAddress,
  evmToAddress,
  isEthereumAddress,
} from '@polkadot/util-crypto';

const SS58_PREFIX = 5;

/**
 * Converts an Ethereum address to a Substrate address.
 *
 * @param address - The address to be converted.
 * @param substratePrefix - The SS58 prefix for the Substrate network.
 * @returns The converted Substrate address
 */
export const convertToSubstrateAddress = (
  address: string,
  substratePrefix: number = SS58_PREFIX
): string => {
  if (isEthereumAddress(address)) {
    return evmToAddress(address, substratePrefix);
  }
  // if Substrate Address, encode it
  return encodeAddress(address, substratePrefix);
};
