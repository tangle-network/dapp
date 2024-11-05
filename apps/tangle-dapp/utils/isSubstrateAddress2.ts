import { isAddress } from '@polkadot/util-crypto';

import { SubstrateAddress } from '../types/utils';

const isSubstrateAddress2 = (address: string): address is SubstrateAddress => {
  return isAddress(address);
};

export default isSubstrateAddress2;
