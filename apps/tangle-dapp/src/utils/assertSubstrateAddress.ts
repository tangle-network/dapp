import { isAddress } from '@polkadot/util-crypto';
import assert from 'assert';

import { SubstrateAddress } from '../types/utils';

const assertSubstrateAddress = (address: string): SubstrateAddress => {
  assert(isAddress(address), 'Address should be a valid Substrate address');

  return address as SubstrateAddress;
};

export default assertSubstrateAddress;
