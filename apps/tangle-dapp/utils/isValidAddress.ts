import { isEthereumAddress } from '@polkadot/util-crypto';
import { SubstrateAddress } from '@webb-tools/tangle-shared-ui/types/utils';
import { Address } from 'viem';

import isSubstrateAddress from './isSubstrateAddress';

/**
 * Check if the address is valid or not. Address can be
 * in EVM format, SS58 format or decoded form.
 */
const isValidAddress = (
  possibleAddress: string,
): possibleAddress is Address | SubstrateAddress => {
  const looksLikeEvm = possibleAddress.replace('0x', '').length === 40;

  return looksLikeEvm
    ? isEthereumAddress(possibleAddress)
    : isSubstrateAddress(possibleAddress);
};

export default isValidAddress;
