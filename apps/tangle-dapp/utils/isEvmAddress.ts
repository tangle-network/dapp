import { isEthereumAddress } from '@polkadot/util-crypto';

import { EvmAddressOrHash } from '../hooks/useEvmAddress';

export function isEvmAddress(address: string): address is EvmAddressOrHash {
  return isEthereumAddress(address);
}
