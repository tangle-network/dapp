import { isEthereumAddress } from '@polkadot/util-crypto';
import { Address } from 'viem';

export function isEvmAddress(address: string): address is Address {
  return isEthereumAddress(address);
}
