import { isAddress } from '@polkadot/util-crypto';
import assert from 'assert';

import { SubstrateAddress } from '../types/utils';

const assertSubstrateAddress = <SS58 extends number>(
  address: string,
  ss58Prefix: SS58,
): SubstrateAddress<SS58> => {
  assert(
    isAddress(address, undefined, ss58Prefix),
    'Address should be a valid Substrate address',
  );

  return address as SubstrateAddress<SS58>;
};

export default assertSubstrateAddress;
