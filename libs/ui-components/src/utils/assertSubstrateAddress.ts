import assert from 'assert';
import { SubstrateAddress } from '../types/address';
import { isSubstrateAddress } from './isSubstrateAddress';

const assertSubstrateAddress = (address: string): SubstrateAddress => {
  assert(
    isSubstrateAddress(address),
    'Address should be a valid Substrate address',
  );

  // TODO: Format the address similar to EVM checksum for consistent & deterministic comparisons between SubstrateAddress types.

  return address as SubstrateAddress;
};

export default assertSubstrateAddress;
