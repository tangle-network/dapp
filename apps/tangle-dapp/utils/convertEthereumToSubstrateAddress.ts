import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';

/**
 * Converts an Ethereum address to a Substrate address.
 *
 * @param ethereumAddress - The Ethereum address to be converted.
 * @param substratePrefix - The SS58 prefix for the Substrate network.
 * @returns The converted Substrate address or 'invalid' if the input is not a valid Ethereum address.
 */
export const convertEthereumToSubstrateAddress = (
  ethereumAddress: string
): string => {
  if (isEthereumAddress(ethereumAddress)) {
    return evmToAddress(ethereumAddress);
  } else {
    return 'invalid';
  }
};
