import { isAddress } from '@polkadot/util-crypto';
import { SubstrateAddress } from '@webb-tools/tangle-shared-ui/types/utils';
import assert from 'assert';

const assertSubstrateAddress = (address: string): SubstrateAddress => {
  assert(isAddress(address), 'Address should be a valid Substrate address');

  return address as SubstrateAddress;
};

export default assertSubstrateAddress;
