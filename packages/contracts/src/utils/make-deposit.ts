import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { pedersenHash } from '@webb-dapp/contracts/utils/pedersen-hash';
import { poseidonHash3, PoseidonHasher3 } from '@webb-dapp/contracts/utils/poseidon-hash3';
import { PoseidonHasher } from '@webb-dapp/utils/merkle/poseidon-hasher';
import { JsNote as DepositNote } from '@webb-tools/wasm-utils';

const tornSnarkjs = require('tornado-snarkjs');
const utils = require('ffjavascript').utils;
const { leBuff2int, unstringifyBigInts } = utils;

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
  const nullifier = leBuff2int(preimage.slice(0, 31));
  const secret = leBuff2int(preimage.slice(31, 62));
  const commitmentBN = poseidonHash3([Number(chainId), nullifier, secret]);
  const nullifierHash = poseidonHasher.hash(null, nullifier, nullifier);
  const commitment = bufferToFixed(commitmentBN);

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

export function depositFromAnchorNote(note: DepositNote): Deposit {
  const poseidonHasher = new PoseidonHasher();
  const noteSecretParts = note.secrets.split(':');
  const chainId = Number(note.targetChainId);
  const preimageString = note.secrets.replaceAll(':', '');
  const preimage = Buffer.from(preimageString);
  const nullifier = leBuff2int(Buffer.from(noteSecretParts[1], 'hex'));
  const secret = leBuff2int(Buffer.from(noteSecretParts[2], 'hex'));
  const commitmentBN = poseidonHash3([Number(note.targetChainId), nullifier, secret]);
  const nullifierHash = poseidonHasher.hash(null, nullifier, nullifier);
  const commitment = bufferToFixed(commitmentBN);

  console.log('commitment: ', commitment);

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

/// todo change to tornado
export function depositFromPreimage(hexString: string): Deposit {
  const preImage = Buffer.from(hexString, 'hex');
  const commitment = pedersenHash(preImage);
  const nullifier = tornSnarkjs.bigInt.leBuff2int(preImage.slice(0, 31));
  const secret = tornSnarkjs.bigInt.leBuff2int(preImage.slice(31, 62));

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
