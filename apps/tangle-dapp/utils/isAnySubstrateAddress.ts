import { isAddress } from '@polkadot/util-crypto';

import { AnySubstrateAddress, RemoveBrand } from '../types/utils';

const isAnySubstrateAddress = (
  address: string,
): address is AnySubstrateAddress & RemoveBrand => {
  return isAddress(address);
};

export default isAnySubstrateAddress;
