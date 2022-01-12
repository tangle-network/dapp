import { encodeAddress } from '@polkadot/keyring';
import { hexToU8a, stringToU8a, u8aConcat } from '@polkadot/util';
import { blake2AsU8a } from '@polkadot/util-crypto';

export function edgToEvm(input: string) {
  const addr = hexToU8a(input);
  const data = stringToU8a('evm:');
  const res = blake2AsU8a(u8aConcat(data, addr));
  return encodeAddress(res, 7);
}
