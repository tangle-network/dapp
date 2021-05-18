import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { pedersenHash } from '@webb-dapp/contracts/utils/pedersen-hash';

const crypto = require('crypto');

export type Deposit = {
  preimage: Uint8Array,
  commitment: string,
  nullifierHash: string
}

export function createDeposit() {
  const preimage = crypto.randomBytes(62);
  const commitment = bufferToFixed(pedersenHash(preimage));
  const nullifierHash = bufferToFixed(pedersenHash(preimage.slice(0, 31)));

  let deposit: Deposit = {
    preimage,
    commitment,
    nullifierHash
  }



  return deposit;
}