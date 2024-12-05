import assert from 'assert';
import { SubstrateAddress } from '../types/address';
import { isSubstrateAddress } from './isSubstrateAddress';

const assertSubstrateAddress = (address: string): SubstrateAddress => {
  assert(
    isSubstrateAddress(address),
    'Address should be a valid Substrate address',
  );

  return address as SubstrateAddress;
};

export default assertSubstrateAddress;
