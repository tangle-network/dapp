import { CircomUtxo, Keypair, Utxo, UtxoGenInput } from '@webb-tools/sdk-core';
import { hexToU8a } from '@webb-tools/utils';
import { JsNote } from '@webb-tools/wasm-utils';
import { BigNumber } from 'ethers';

async function utxoFromVAnchorNote(note: JsNote, leafIndex = 0): Promise<Utxo> {
  const noteSecretParts = note.secrets.split(':');
  const chainId = note.targetChainId;
  const amount = BigNumber.from('0x' + noteSecretParts[1]).toString();
  const secretKey = '0x' + noteSecretParts[2];
  const blinding = '0x' + noteSecretParts[3];
  const originChainId = note.sourceChainId;

  const keypair = new Keypair(secretKey);

  const input: UtxoGenInput = {
    curve: note.curve,
    backend: note.backend,
    amount,
    blinding: hexToU8a(blinding),
    originChainId,
    chainId,
    index: leafIndex.toString(),
    keypair,
  };

  return input.backend === 'Arkworks'
    ? Utxo.generateUtxo(input)
    : CircomUtxo.generateUtxo(input);
}

export default utxoFromVAnchorNote;
