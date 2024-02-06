import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';

/**
 * Converts an Ethereum address to a Substrate address.
 *
 * @param address - The address to be converted.
 * @returns The converted Substrate address
 */
export const convertToSubstrateAddress = (address: string): string => {
  if (isEthereumAddress(address)) {
    return evmToAddress(address);
  } else {
    return null;
  }
};
