import { GroupTreeWrapper } from '@webb-dapp/mixer';
// @ts-ignore1
import Worker from '@webb-dapp/mixer/utils/merkle.worker';
import MerkleTree from '@webb-tools/sdk-merkle/tree';
import { Note } from '@webb-tools/sdk-mixer';
import { MerkleTree as NodeMerkleTree } from '@webb-tools/types/interfaces';

import { decodeAddress } from '@polkadot/keyring';
import { u8aToHex } from '@polkadot/util';

import { MixerWithdraw, WithdrawState } from '../../webb-context';
import { WebbPolkadot } from './webb-polkadot-provider';

export class PolkadotMixerWithdraw extends MixerWithdraw<WebbPolkadot> {
  private cachedBulletProofsGens: Uint8Array | null = null;
  private merkleTree: MerkleTree | null = null;
  private loading = false;
  private initialised = false;

  private async getMerkleTree(): Promise<MerkleTree> {
    this.inner.api;
    // already ready
    if (this.merkleTree) {
      await this.merkleTree.restart(new Worker());
      return this.merkleTree;
    }
    // on progress
    if (this.loading) {
      return new Promise((resolve, reject) => {
        let cb: any;
        cb = this.on('ready', async () => {
          // remove listener
          cb && cb();
          const merkleTree = this.getMerkleTree();
          resolve(merkleTree);
        });
      });
    }
    // Init
    this.emit('loading', true);
    this.loading = true;
    const bulletProofGens = await this.getBulletProofGens();
    this.merkleTree = await MerkleTree.create(new Worker(), 32, bulletProofGens);
    this.loading = false;
    this.emit('loading', false);
    this.emit('ready', undefined);
    this.initialised = true;
    return this.merkleTree;
  }

  private async generateBulletProofs() {
    const worker = new Worker();
    const bulletProofGens = await MerkleTree.preGenerateBulletproofGens(worker);
    worker.terminate();
    const decoder = new TextDecoder();
    const bulletProofGensString = decoder.decode(bulletProofGens); // from Uint8Array to String
    localStorage.setItem('bulletproof_gens', bulletProofGensString);
    return bulletProofGens;
  }

  private async getBulletProofGens(): Promise<Uint8Array> {
    if (this.cachedBulletProofsGens) {
      return this.cachedBulletProofsGens;
    }
    const cachedBulletProof = localStorage.getItem('bulletproof_gens');
    if (!cachedBulletProof) {
      this.cachedBulletProofsGens = await this.generateBulletProofs();
      return this.cachedBulletProofsGens;
    }
    const encoder = new TextEncoder();
    const gens = encoder.encode(cachedBulletProof);
    this.cachedBulletProofsGens = gens;
    return gens;
  }

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
    const merkleTree = await this.getMerkleTree();
    // parse the note
    const noteParsed = Note.deserialize(note);
    const treeId = noteParsed.id;
    // @ts-ignore
    const nodeMerkleTree: NodeMerkleTree = await this.inner.api.query.merkle.trees([treeId]);
    const groupTreeWrapper = new GroupTreeWrapper(nodeMerkleTree);
    const leaves = await this.fetchTreeLeaves(treeId);
    await merkleTree.addLeaves(leaves);
    try {
      const zk = await merkleTree.generateZKProof({
        note,
        recipient: decodeAddress(recipient),
        relayer: decodeAddress(recipient),
        root: groupTreeWrapper.rootHashU8a as any,
      });

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
        throw new Error('no account available');
      }
      await tx.call(account.address);
      this.emit('stateChange', WithdrawState.Done);
    } catch (e) {
      this.emit('error', 'Failed to generate zero knowlage proof');
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
