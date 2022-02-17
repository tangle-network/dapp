import type { OperationError } from '@webb-tools/wasm-utils';

import { ChainId } from '@webb-dapp/apps/configs';
// @ts-ignore
import Worker from '@webb-dapp/mixer/utils/proving-manager.worker';
import { WithdrawState } from '@webb-dapp/react-environment';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers';
import { getCachedFixtureURI, withLocalFixtures } from '@webb-dapp/utils/misc';
import { WebbError, WebbErrorCodes } from '@webb-dapp/utils/webb-error';
import { LoggerService } from '@webb-tools/app-util';
import { Note, ProvingManager } from '@webb-tools/sdk-core';
import { ProvingManagerSetupInput } from '@webb-tools/sdk-core/proving/proving-manager-thread';

import { decodeAddress } from '@polkadot/keyring';
import { hexToU8a, u8aToHex } from '@polkadot/util';

import { BridgeWithdraw } from '../../webb-context/bridge/bridge-withdraw';
const logger = LoggerService.get('PolkadotBridgeWithdraw');
export type AnchorWithdrawProof = {
  id: string;
  proofBytes: string;
  root: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: number;
  refund: number;
  commitment: string;
};

export class PolkadotBridgeWithdraw extends BridgeWithdraw<WebbPolkadot> {
  async fetchRPCTreeLeaves(treeId: string | number): Promise<Uint8Array[]> {
    console.log(`Fetching leaves for tree with id ${treeId}`);
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
  async fetchCachedRoot(treeId: string) {
    console.log(`fetching metadata for tree id ${treeId}`);
    const storage =
      // @ts-ignore
      await this.inner.api.query.merkleTreeBn254.trees(treeId);
    // @ts-ignore
    return storage.toHuman().root;
  }
  async withdraw(note: string, recipient: string): Promise<string> {
    // TODO: implement cross chain
    // TODO: Integrate with Substrate relayer
    // TODO handle the cached roots
    try {
      const account = await this.inner.accounts.activeOrDefault;
      if (!account) {
        throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
      }
      const accountId = account.address;
      const relayerAccountId = account.address;
      this.emit('stateChange', WithdrawState.GeneratingZk);
      logger.trace(`Withdraw using note ${note} , recipient ${recipient}`);
      const parseNote = await Note.deserialize(note);
      const depositNote = parseNote.note;
      const amount = parseNote.note.amount;
      const anchors = await this.inner.methods.bridgeApi.getAnchors();
      const anchor = anchors.find((a) => a.amount === amount)!;
      const treeId = anchor.neighbours[ChainId.WebbDevelopment] as string;

      const leaves = await this.fetchRPCTreeLeaves(treeId);
      const leaf = depositNote.getLeafCommitment();
      const leafHex = u8aToHex(leaf);
      let leafIndex = leaves.findIndex((leaf) => u8aToHex(leaf) === leafHex);

      const sourceChainId = Number(depositNote.sourceChainId) as ChainId;
      const targetChainId = Number(depositNote.targetChainId) as ChainId;

      const pm = new ProvingManager(new Worker());

      const recipientAccountHex = u8aToHex(decodeAddress(recipient));
      const relayerAccountHex = u8aToHex(decodeAddress(recipient));
      const provingKey = await fetchSubstrateProvingKey();
      const commitment = '0000000000000000000000000000000000000000000000000000000000000000';
      const root = await this.fetchCachedRoot(treeId);

      const proofInput: ProvingManagerSetupInput = {
        leaves,
        note,
        leafIndex,
        refund: 0,
        fee: 0,
        recipient: recipientAccountHex.replace('0x', ''),
        relayer: relayerAccountHex.replace('0x', ''),
        provingKey,
        commitment,
        roots: [hexToU8a(root), hexToU8a(root)],
      };
      const zkProofMetadata = await pm.proof(proofInput);
      const withdrawProof: AnchorWithdrawProof = {
        id: treeId,
        proofBytes: `0x${zkProofMetadata.proof}` as any,
        root: `0x${zkProofMetadata.root}`,
        nullifierHash: `0x${zkProofMetadata.nullifierHash}`,
        recipient: accountId,
        relayer: relayerAccountId,
        fee: 5,
        refund: 1,
        commitment: `0x${commitment}`,
      };
      const parms = [
        withdrawProof.id,
        withdrawProof.proofBytes,
        zkProofMetadata.roots.map((i: string) => `0x${i}`),
        withdrawProof.nullifierHash,
        withdrawProof.recipient,
        withdrawProof.relayer,
        withdrawProof.fee,
        withdrawProof.refund,
        withdrawProof.commitment,
      ];

      this.emit('stateChange', WithdrawState.SendingTransaction);
      const tx = this.inner.txBuilder.build(
        {
          section: 'anchorBn254',
          method: 'withdraw',
        },
        parms
      );
      const hash = await tx.call(account.address);
      this.emit('stateChange', WithdrawState.Done);
      return hash || '';
    } catch (e) {
      this.emit('stateChange', WithdrawState.Failed);
      throw e;
    }
  }
}
async function fetchSubstrateProvingKey() {
  // TODO: change to anchor fixture
  const IPFSUrl = `https://ipfs.io/ipfs/QmYDtGX7Wf5qUPEpGsgrX6oss2m2mm8vi7uzNdK4C9yJdZ`;
  const cachedURI = getCachedFixtureURI('proving_key_uncompressed_anchor.bin');
  const ipfsKeyRequest = await fetch(withLocalFixtures() ? cachedURI : IPFSUrl);
  const circuitKeyArrayBuffer = await ipfsKeyRequest.arrayBuffer();
  logger.info(`Done Fetching key`);
  const circuitKey = new Uint8Array(circuitKeyArrayBuffer);
  return circuitKey;
}
