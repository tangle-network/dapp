import { isAddress } from '@polkadot/util-crypto';

import { SubstrateAddress, RemoveBrand } from '../types/utils';

const isAnySubstrateAddress = (
  address: string,
): address is SubstrateAddress & RemoveBrand => {
  return isAddress(address);
};

export default isAnySubstrateAddress;
