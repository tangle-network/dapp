// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { IAnchorDepositInfo } from '@webb-tools/interfaces';
// TODO: Update after protocol-solidity moves 'poseidonHash' to 'PoseidonHasher'
import { Keypair, PoseidonHasher, toFixedHex, Utxo } from '@webb-tools/utils';
import { JsNote as DepositNote } from '@webb-tools/wasm-utils';

import { keypairStorageFactory } from '../../';

export function depositFromAnchorNote(note: DepositNote): IAnchorDepositInfo {
  const poseidonHasher = new PoseidonHasher();
  const noteSecretParts = note.secrets.split(':');
  const chainId = Number(note.targetChainId);
  const nullifier = '0x' + noteSecretParts[1];
  const secret = '0x' + noteSecretParts[2];
  const commitmentBN = poseidonHasher.hash3([chainId, nullifier, secret]);
  const nullifierHash = poseidonHasher.hash(null, nullifier, nullifier);
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

export async function utxoFromVAnchorNote(note: DepositNote): Promise<Utxo> {
  const noteSecretParts = note.secrets.split(':');
  const chainId = '0x' + noteSecretParts[0];
  const amount = '0x' + noteSecretParts[1];
  const blinding = '0x' + noteSecretParts[3];

  const keypairStorage = await keypairStorageFactory();
  const storedKeypair = await keypairStorage.get('keypair');

  if (!storedKeypair.keypair) {
    throw new Error('Cannot withdraw without the configured keypair');
  }

  const keypair = new Keypair(storedKeypair.keypair);

  return new Utxo({ amount, blinding, chainId, keypair });
}
