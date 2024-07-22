import { isAddress } from '@polkadot/util-crypto';
import assert from 'assert';

import { AnySubstrateAddress } from '../types/utils';

const assertAnySubstrateAddress = (address: string): AnySubstrateAddress => {
  assert(isAddress(address), 'Address should be a valid Substrate address');

  return address as AnySubstrateAddress;
};

export default assertAnySubstrateAddress;
