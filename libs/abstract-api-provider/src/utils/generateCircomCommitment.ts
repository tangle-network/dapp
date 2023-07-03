import { poseidon } from 'circomlibjs';
import { Keypair } from '@webb-tools/sdk-core';
import { JsNote } from '@webb-tools/wasm-utils';

/**
 * Generate the commitment of the note
 * @param note The inner js note to generate the commitment (obtain from note.note)
 * @returns The commitment of the note
 */
const generateCircomCommitment = (note: JsNote): bigint => {
  const noteSecretParts = note.secrets.split(':');
  const chainId = BigInt('0x' + noteSecretParts[0]).toString();
  const amount = BigInt('0x' + noteSecretParts[1]).toString();
  const secretKey = '0x' + noteSecretParts[2];
  const blinding = '0x' + noteSecretParts[3];

  const keypair = new Keypair(secretKey);

  const hash = poseidon([chainId, amount, keypair.getPubKey(), blinding]);

  return BigInt(hash);
};

export default generateCircomCommitment;
