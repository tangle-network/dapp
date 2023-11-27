import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';

const SS58_PREFIX = 5;

/**
 * Converts an Ethereum address to a Substrate address.
 *
 * @param ethereumAddress - The Ethereum address to be converted.
 * @param substratePrefix - The SS58 prefix for the Substrate network.
 * @returns The converted Substrate address or 'invalid' if the input is not a valid Ethereum address.
 */
export const convertEthereumToSubstrateAddress = (
  ethereumAddress: string,
  substratePrefix: number = SS58_PREFIX
): string => {
  if (isEthereumAddress(ethereumAddress)) {
    return evmToAddress(ethereumAddress, substratePrefix);
  } else {
    return 'invalid';
  }
};
