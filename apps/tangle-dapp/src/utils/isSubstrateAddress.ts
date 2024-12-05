import { isAddress } from '@polkadot/util-crypto';

import { SubstrateAddress } from '../types/utils';

const isSubstrateAddress = (address: string): address is SubstrateAddress => {
  return isAddress(address);
};

export default isSubstrateAddress;
