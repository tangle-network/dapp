import { GroupTreeWrapper } from '@webb-dapp/mixer';
// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/proving-mananger.worker';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Note } from '@webb-tools/sdk-mixer';
import { ProvingManger } from '@webb-tools/sdk-core';

import { MixerWithdraw, WithdrawState } from '../../webb-context';
import { WebbPolkadot } from './webb-polkadot-provider';
import { PolkadotMixerDeposit } from '.';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { hexToU8a, u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/keyring';
import { LoggerService } from '@webb-tools/app-util';
import { ProvingManagerSetupInput } from '@webb-tools/sdk-core/proving/proving-manager-thread';
async function fetchSubstratePK() {
  const req = await fetch('/sub-fixtures/proving_key_uncompresed.bin');
  const res = await req.arrayBuffer();
  return new Uint8Array(res);
}
type WithdrawProof = {
  id: string;
  proof_bytes: string;
  root: string;
  nullifier_hash: string;
  recipient: string;
  relayer: string;
  fee: string;
  refund: string;
};
const logger = LoggerService.get('PolkadotMixerWithdraw');
export class PolkadotMixerWithdraw extends MixerWithdraw<WebbPolkadot> {
  private loading = false;
  private initialised = true;

  cancelWithdraw(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async fetchTreeLeaves(treeId: string | number): Promise<Uint8Array[]> {
    let done = false;
    let from = 0;
    let to = 511;
    const leaves: Uint8Array[] = [];

    while (done === false) {
      const treeLeaves: any[] = await (this.inner.api.rpc as any).mt.getLeaves(treeId, from, to);
      if (treeLeaves.length === 0) {
        done = true;
        break;
      }
      leaves.push(...treeLeaves.map((i) => i.toU8a()));
      from = to;
      to = to + 511;
    }
    return leaves;
  }

  async withdraw(note: string, recipient: string): Promise<void> {
    this.emit('stateChange', WithdrawState.GeneratingZk);
    // parse the note
    const noteParsed = await Note.deserialize(note);
    const depositAmount = noteParsed.note.amount;
    const amount = depositAmount;
    const sizes = await PolkadotMixerDeposit.getSizes(this.inner.api);
    const treeId = sizes.find((s) => s.value === amount)?.treeId!;
    logger.info(`treeid `, treeId);
    // @ts-ignore
    const nodeMerkleTree = await this.inner.api.query.merkleTreeBn254.trees(treeId);
    const groupTreeWrapper = new GroupTreeWrapper(nodeMerkleTree);
    const leaves = await this.fetchTreeLeaves(treeId);
    const leaf = u8aToHex(noteParsed.getLeaf());
    const leafIndex = leaves.findIndex((l) => u8aToHex(l) === leaf);
    logger.info(`leaf ${leaf} has index `, leafIndex);

    logger.info(leaves.map((i) => u8aToHex(i)));
    try {
      const pm = new ProvingManger(new Worker());
      const hexAddress = u8aToHex(decodeAddress('jn5LuB5d51srpmZqiBNgWu11C6AeVxEygggjWsifcG1myqr'));
      const provingKey = await fetchSubstratePK();
      const proofInput: ProvingManagerSetupInput = {
        leaves,
        note,
        leafIndex,
        refund: 0,
        fee: 0,
        recipient: hexAddress.replace('0x', ''),
        relayer: hexAddress.replace('0x', ''),
        provingKey,
      };
      logger.info(`proofInput `, proofInput);

      const zk = await pm.proof(proofInput);

      const withdrawProof: WithdrawProof = {
        id: treeId,
        proof_bytes: zk.proof as any,
        root: zk.root,
        nullifier_hash: zk.nullifier_hash,
        recipient: hexAddress.replace('0x', ''),
        relayer: hexAddress.replace('0x', ''),
        fee: bufferToFixed('0'),
        refund: bufferToFixed('0'),
      };
      logger.info(`WithdrawProof`, withdrawProof);
      this.emit('stateChange', WithdrawState.SendingTransaction);
      const tx = this.inner.txBuilder.build(
        {
          section: 'mixerBn254',
          method: 'withdraw',
        },
        [
          treeId,
          `0x${withdrawProof.proof_bytes}`,
          `0x${withdrawProof.root}`,
          `0x${withdrawProof.nullifier_hash}`,
          'jn5LuB5d51srpmZqiBNgWu11C6AeVxEygggjWsifcG1myqr',
          'jn5LuB5d51srpmZqiBNgWu11C6AeVxEygggjWsifcG1myqr',
          0,
          0,
        ]
      );
      tx.on('finalize', () => {
        console.log('withdraw done');
      });
      tx.on('failed', () => {
        console.log('withdraw failed');
      });
      tx.on('extrinsicSuccess', () => {
        console.log('withdraw done');
      });
      const account = await this.inner.accounts.activeOrDefault;
      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }
      await tx.call(account.address);
      this.emit('stateChange', WithdrawState.Done);
    } catch (e) {
      this.emit('error', 'Failed to generate zero knowledge proof');
      this.emit('stateChange', WithdrawState.Failed);
      throw e;
    }

    // get mixer
    // get tree leaves
    // get mixer info
    // get Tree leaves from RPC calls
    // add leaves to the merkle tree
    // generate zk proof
    //  submit the transaction
  }
}
