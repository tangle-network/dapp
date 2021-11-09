import { GroupTreeWrapper } from '@webb-dapp/mixer';
// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/proving-mananger.worker';
import { ProvingManger } from '@webb-dapp/mixer/utils/proving-manger';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { Note, ZKProof } from '@webb-tools/sdk-mixer';

import { u8aToHex } from '@polkadot/util';

import { MixerWithdraw, WithdrawState } from '../../webb-context';
import { WebbPolkadot } from './webb-polkadot-provider';

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
      const treeLeaves: Uint8Array[] = await (this.inner.api.rpc as any).merkle.treeLeaves(treeId, from, to);
      if (treeLeaves.length === 0) {
        done = true;
        break;
      }
      leaves.push(...treeLeaves);
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
    const treeId = depositAmount;
    // @ts-ignore
    const nodeMerkleTree: NodeMerkleTree = await this.inner.api.query.merkle.trees([treeId]);
    const groupTreeWrapper = new GroupTreeWrapper(nodeMerkleTree);
    const leaves = await this.fetchTreeLeaves(treeId);

    try {
      const pm = new ProvingManger(worker);
      const zk = (await pm.proof({
        leaves,
        note,
        recipient,
        relayer: recipient,
      })) as ZKProof;

      const blockNumber = await this.inner.api.query.system.number();
      const withdrawProof = {
        cached_block: blockNumber,
        cached_root: groupTreeWrapper.rootHashU8a,
        comms: zk.commitments,
        leaf_index_commitments: zk.leafIndexCommitments,
        mixer_id: treeId,
        nullifier_hash: zk.nullifierHash,
        proof_bytes: u8aToHex(zk.proof),
        proof_commitments: zk.proofCommitments,
        recipient: recipient,
        relayer: recipient,
      };

      this.emit('stateChange', WithdrawState.SendingTransaction);
      const tx = this.inner.txBuilder.build(
        {
          section: 'mixer',
          method: 'withdraw',
        },
        [withdrawProof]
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
