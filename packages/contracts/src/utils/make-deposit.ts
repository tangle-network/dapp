import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { pedersenHash } from '@webb-dapp/contracts/utils/pedersen-hash';
import { poseidonHash3 } from '@webb-dapp/contracts/utils/poseidon-hash3';
import { PoseidonHasher } from '@webb-dapp/utils/merkle/poseidon-hasher';
const snarkjs = require('tornado-snarkjs');

const crypto = require('crypto');
// const utils = require('ffjavascript').utils;
// const rbigint = (nbytes: number) => utils.leBuff2int(crypto.randomBytes(nbytes));

export type Deposit = {
  preimage: Uint8Array;
  commitment: string;
  nullifierHash: string;
  secret: string;
  nullifier: string;
  chainId?: number;
};

export function createTornDeposit() {
  const preimage = crypto.randomBytes(62);
  const nullifier = preimage.slice(0, 31);
  const secret = preimage.slice(31, 62);
  const commitment = bufferToFixed(pedersenHash(preimage));
  const nullifierHash = bufferToFixed(pedersenHash(nullifier));

  let deposit: Deposit = {
    preimage,
    commitment,
    nullifierHash,
    nullifier: bufferToFixed(nullifier),
    secret: bufferToFixed(secret),
  };

  return deposit;
}

export function createAnchor2Deposit(chainId: number) {
  const poseidonHasher = new PoseidonHasher();
  const preimage = crypto.randomBytes(62);
  const nullifier = preimage.slice(0, 31);
  const secret = preimage.slice(31, 62);
  const commitment = poseidonHash3([chainId, nullifier, secret]);
  const nullifierHash = poseidonHasher.hash(null, nullifier, nullifier);

  let deposit: Deposit = {
    preimage,
    commitment,
    nullifierHash,
    nullifier: bufferToFixed(nullifier),
    secret: bufferToFixed(secret),
    chainId: chainId,
  };
  return deposit;
}

export function depositFromPreimage(hexString: string): Deposit {
  const preImage = Buffer.from(hexString, 'hex');
  const commitment = pedersenHash(preImage);
  const nullifier = snarkjs.bigInt.leBuff2int(preImage.slice(0, 31));
  const secret = snarkjs.bigInt.leBuff2int(preImage.slice(31, 62));

  const nullifierHash = pedersenHash(nullifier.leInt2Buff(31));
  const deposit: Deposit = {
    preimage: preImage,
    commitment,
    nullifierHash,
    nullifier: nullifier,
    secret: secret,
  };
  return deposit;
}
