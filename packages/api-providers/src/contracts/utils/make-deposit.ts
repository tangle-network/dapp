// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type { JsNote as DepositNote } from '@webb-tools/wasm-utils';

import { IAnchorDepositInfo } from '@webb-tools/interfaces';
import { CircomUtxo, Keypair, toFixedHex, Utxo } from '@webb-tools/sdk-core';

import { hexToU8a } from '@polkadot/util';

const { poseidon } = require('circomlibjs');

import { BigNumber } from 'ethers';

import { keypairStorageFactory } from '../../utils/storage';

export function depositFromAnchorNote(note: DepositNote): IAnchorDepositInfo {
  const noteSecretParts = note.secrets.split(':');
  const chainId = Number(note.targetChainId);
  const nullifier = '0x' + noteSecretParts[1];
  const secret = '0x' + noteSecretParts[2];
  const commitmentBN = poseidon([chainId, nullifier, secret]);
  const nullifierHash = poseidon([null, nullifier, nullifier]);
  const commitment = toFixedHex(commitmentBN);

  const deposit: IAnchorDepositInfo = {
    chainID: BigInt(chainId),
    commitment,
    nullifier: BigInt(toFixedHex(nullifier)),
    nullifierHash,
    secret: BigInt(toFixedHex(secret)),
  };

  return deposit;
}

export async function utxoFromVAnchorNote(note: DepositNote, leafIndex: number): Promise<Utxo> {
  const noteSecretParts = note.secrets.split(':');
  const chainId = note.targetChainId;
  const amount = BigNumber.from('0x' + noteSecretParts[1]).toString();
  const secretKey = '0x' + noteSecretParts[2];
  const blinding = '0x' + noteSecretParts[3];
  const originChainId = note.sourceChainId;

  const keypairStorage = await keypairStorageFactory();
  const storedKeypair = await keypairStorage.get('keypair');

  if (!storedKeypair.keypair) {
    throw new Error('Cannot withdraw without the configured keypair');
  }

  const keypair = new Keypair(storedKeypair.keypair);

  return CircomUtxo.generateUtxo({
    curve: note.curve,
    backend: note.backend,
    amount,
    blinding: hexToU8a(blinding),
    privateKey: hexToU8a(secretKey),
    originChainId,
    chainId,
    index: leafIndex.toString(),
    keypair,
  });
}

export const generateCircomCommitment = (note: DepositNote): string => {
  const noteSecretParts = note.secrets.split(':');
  const chainId = BigNumber.from('0x' + noteSecretParts[0]).toString();
  const amount = BigNumber.from('0x' + noteSecretParts[1]).toString();
  const secretKey = '0x' + noteSecretParts[2];
  const blinding = '0x' + noteSecretParts[3];

  const keypair = new Keypair(secretKey);

  const hash = poseidon([chainId, amount, keypair.pubkey, blinding]);

  return BigNumber.from(hash).toHexString();
};
