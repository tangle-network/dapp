import { isAddress } from '@polkadot/util-crypto';
import assert from 'assert';

import { AnySubstrateAddress } from '../types/utils';

type AnySubstrateAddressAssertionFn = (
  address: string,
) => asserts address is AnySubstrateAddress;

const assertAnySubstrateAddress: AnySubstrateAddressAssertionFn = (address) => {
  assert(isAddress(address), 'Address should be a valid Substrate address');
};

export default assertAnySubstrateAddress;
