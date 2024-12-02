import {
  ParametersOfTransactMethod,
  TransactionPayloadType,
  TransferTransactionPayloadType,
  VAnchorActions,
  WithdrawTransactionPayloadType,
  generateCircomCommitment,
  isVAnchorDepositPayload,
  isVAnchorTransferPayload,
  isVAnchorWithdrawPayload,
  utxoFromVAnchorNote,
} from '@webb-tools/abstract-api-provider';
import {
  ApiConfig,
  createSubstrateResourceId,
  ensureHex,
} from '@webb-tools/dapp-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  ChainType,
  Keypair,
  Note,
  ResourceId,
  Utxo,
  toFixedHex,
} from '@webb-tools/sdk-core';
import BN from 'bn.js';

import { ApiPromise } from '@polkadot/api';
import { hexToU8a } from '@polkadot/util';
import { NeighborEdge } from '@webb-tools/abstract-api-provider/vanchor/types';
import { bridgeStorageFactory } from '@webb-tools/browser-utils';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config';
import { AddressType } from '@webb-tools/dapp-config/types';
import { zeroAddress } from 'viem';
import { getLeafIndex } from '../mt-utils';
import { WebbPolkadot } from '../webb-provider';

export class PolkadotVAnchorActions extends VAnchorActions<
  'polkadot',
  WebbPolkadot
> {
  static async getNextIndex(
    apiConfig: ApiConfig,
    typedChainId: number,
    fungibleCurrencyId: number,
  ): Promise<bigint> {
    const chain = apiConfig.chains[typedChainId];
    const treeIdStr = apiConfig.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId,
    );

    if (!chain || !treeIdStr) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const endpoints = chain.rpcUrls.default.webSocket;
    if (!endpoints || endpoints.length === 0) {
      throw WebbError.from(WebbErrorCodes.NoEndpointsConfigured);
    }

    const api = await WebbPolkadot.getApiPromise(endpoints[0]);
    const treeId = Number(treeIdStr);
    if (isNaN(treeId)) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const nextIdx = await api.query.merkleTreeBn254.nextLeafIndex(treeId);

    return BigInt(nextIdx.toHex());
  }

  prepareTransaction(
    payload: TransactionPayloadType,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> | never {
    if (isVAnchorDepositPayload(payload)) {
      return this.prepareDepositTransaction(payload, wrapUnwrapAssetId);
    } else if (isVAnchorWithdrawPayload(payload)) {
      return this.prepareWithdrawTransaction(payload, wrapUnwrapAssetId);
    } else if (isVAnchorTransferPayload(payload)) {
      return this.prepareTransferTransaction(payload, wrapUnwrapAssetId);
    }

    throw new Error('Unsupported payload type');
  }

  async transact(
    _treeId: string,
    _inputs: Utxo[],
    _outputs: Utxo[],
    _fee: bigint,
    _refund: bigint,
    _recipient: string,
    _wrapUnwrapAssetId: string,
    _leavesMap: Record<string, Uint8Array[]>,
  ) {
    return ensureHex(zeroAddress);
  }

  async waitForFinalization(_hash: AddressType): Promise<void> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async isPairRegistered(
    _treeId: string,
    _account: string,
    _pubkey: string,
  ): Promise<boolean> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async register(
    _treeId: string,
    _account: string,
    _pubkey: string,
  ): Promise<boolean> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async syncNotesForKeypair(
    _anchorAddress: string,
    _owner: Keypair,
    _startingBlock?: bigint,
    _abortSignal?: AbortSignal,
  ): Promise<Note[]> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  /**
   * A function to get the leaf index of a leaf in the tree
   * @param leaf the leaf to search for
   * @param indexBeforeInsertion the tree index before insertion
   * @param addressOrTreeId the address or tree id of the tree
   */
  async getLeafIndex(
    _txHash: string,
    note: Note,
    indexBeforeInsertion: number,
    addressOrTreeId: string,
  ): Promise<bigint> {
    const leaf = note.getLeaf();
    const treeId = Number(addressOrTreeId);
    const idx = await getLeafIndex(
      this.inner.api,
      leaf,
      indexBeforeInsertion,
      treeId,
    );
    return BigInt(idx);
  }

  async getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number,
  ): Promise<bigint> {
    const chain = this.inner.config.chains[typedChainId];
    const treeIdStr = this.inner.config.getAnchorIdentifier(
      fungibleCurrencyId,
      typedChainId,
    );

    if (!chain || !treeIdStr) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const treeId = Number(treeIdStr);
    if (isNaN(treeId)) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const nextIdx =
      await this.inner.api.query.merkleTreeBn254.nextLeafIndex(treeId);
    return BigInt(nextIdx.toHex());
  }

  async getResourceId(
    treeId: string,
    chainId: number,
    _: ChainType,
  ): Promise<ResourceId> {
    const palletId = await this.getVAnchorPalletId(this.inner.api);
    return createSubstrateResourceId(chainId, +treeId, palletId.toString());
  }

  async commitmentsSetup(notes: Note[]) {
    if (notes.length === 0) {
      throw new Error('No notes to deposit');
    }

    // In the withdraw/transfer flows, the destination chain is the current chain
    const destApi = this.inner.api;

    // Loop through the notes and populate the leaves map
    const leavesMap: Record<string, Uint8Array[]> = {};

    const notesLeaves = await Promise.all(
      notes.map((note) => this.fetchNoteLeaves(note, leavesMap, destApi)),
    );

    // Keep track of the leafindices for each note
    const leafIndices: number[] = [];

    // Create input UTXOs for convenience calculations
    const inputUtxos: Utxo[] = [];

    // calculate the sum of input notes (for calculating the change utxo)
    let sumInputNotes = new BN(0);

    notesLeaves.forEach(({ amount, leafIndex, utxo }) => {
      sumInputNotes = sumInputNotes.add(amount);
      leafIndices.push(leafIndex);
      inputUtxos.push(utxo);
    });

    return {
      sumInputNotes,
      inputUtxos,
      leavesMap,
    };
  }

  async getLatestNeighborEdges(
    _fungibleId: number,
    _typedChainId?: number | undefined,
  ): Promise<readonly NeighborEdge[]> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  async validateInputNotes(
    _notes: readonly Note[],
    _typedChainId: number,
    _fungibleId: number,
  ): Promise<boolean> {
    throw WebbError.from(WebbErrorCodes.NotImplemented);
  }

  // ------------------ Private ------------------

  private async prepareDepositTransaction(
    payload: Note,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> {
    const activeAccount = await this.inner.accounts.activeOrDefault;
    if (!activeAccount) {
      throw new Error('No active account');
    }

    const address = activeAccount.address;

    const depositUtxo = await utxoFromVAnchorNote(
      payload.note,
      +payload.note.index,
    );
    const inputUtxos: Utxo[] = [];

    const leavesMap: Record<number, Uint8Array[]> = {};

    leavesMap[+payload.note.sourceChainId] = [];

    return [
      payload.note.sourceIdentifyingData,
      inputUtxos,
      [depositUtxo],
      ZERO_BIG_INT,
      ZERO_BIG_INT,
      address,
      wrapUnwrapAssetId,
      leavesMap,
    ] satisfies ParametersOfTransactMethod<'polkadot'>;
  }

  private async prepareWithdrawTransaction(
    payload: WithdrawTransactionPayloadType,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> {
    const { changeUtxo, notes, recipient, refundAmount, feeAmount } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes);

    return Promise.resolve([
      notes[0].note.targetIdentifyingData, // contractAddress
      inputUtxos, // inputs
      [changeUtxo], // outputs
      feeAmount, // fee
      refundAmount, // refund
      recipient, // recipient
      wrapUnwrapAssetId, // wrapUnwrapAssetId
      leavesMap, // leavesMap
    ]);
  }

  private async prepareTransferTransaction(
    payload: TransferTransactionPayloadType,
    wrapUnwrapAssetId: string,
  ): Promise<ParametersOfTransactMethod<'polkadot'>> {
    const { notes, changeUtxo, transferUtxo, feeAmount } = payload;

    const { inputUtxos, leavesMap } = await this.commitmentsSetup(notes);

    return Promise.resolve([
      notes[0].note.targetIdentifyingData, // contractAddress
      inputUtxos, // inputs
      [changeUtxo, transferUtxo], // outputs
      feeAmount, // fee
      ZERO_BIG_INT, // refund
      zeroAddress, // recipient
      wrapUnwrapAssetId, // wrapUnwrapAssetId
      leavesMap, // leavesMap
    ]);
  }

  private async fetchNoteLeaves(
    note: Note,
    leavesMap: Record<string, Uint8Array[]>,
    destApi: ApiPromise,
  ): Promise<{ leafIndex: number; utxo: Utxo; amount: BN }> | never {
    const {
      amount,
      sourceChainId: sourceTypedChainId,
      sourceIdentifyingData: sourceTreeId,
      targetChainId: targetTypedChainId,
      targetIdentifyingData: targetTreeId,
    } = note.note;

    const amountBN = new BN(amount);

    let destRelayedRoot: string;
    let treeHeight: number;

    // Get the latest root that has been relayed from the source chain to the destination chain
    if (sourceTypedChainId === targetTypedChainId) {
      const destTree = (
        (await destApi.query.merkleTreeBn254.trees(+targetTreeId)) as any
      ).unwrapOr(null);

      if (!destTree) {
        throw WebbError.from(WebbErrorCodes.AnchorIdNotFound);
      }

      destRelayedRoot = destTree.root.toHex();
      treeHeight = destTree.depth.toNumber();
    } else {
      // Not implemented cross chain substrate <> evm transactions yet.
      throw WebbError.from(WebbErrorCodes.NotImplemented);
    }

    // Fixed the root to be 32 bytes
    destRelayedRoot = toFixedHex(destRelayedRoot);

    // The commitment of the note
    const commitment = await generateCircomCommitment(note.note);

    // Fetch leaves of the source chain if not already fetched
    if (!leavesMap[sourceTypedChainId]) {
      const sourceChainConfig = this.inner.config.chains[+sourceTypedChainId];
      const sourceChainEndpoint =
        sourceChainConfig.rpcUrls.default.webSocket?.[0];

      if (!sourceChainEndpoint) {
        throw WebbError.from(WebbErrorCodes.NoEndpointsConfigured);
      }

      const api =
        String(this.inner.typedChainId) === sourceTypedChainId
          ? this.inner.api
          : await WebbPolkadot.getApiPromise(sourceChainEndpoint);

      const chainId = parseInt(
        api.consts.linkableTreeBn254.chainIdentifier.toHex(),
      );
      const palletId = await this.getVAnchorPalletId(api);

      const resourceId = createSubstrateResourceId(
        chainId,
        +sourceTreeId,
        String(palletId),
      );

      const leafStorage = await bridgeStorageFactory(resourceId.toString());
      const { provingLeaves } = await this.inner.getVAnchorLeaves(
        api,
        leafStorage,
        {
          treeHeight,
          targetRoot: destRelayedRoot,
          commitment,
          palletId,
          treeId: +sourceTreeId,
        },
      );

      leavesMap[sourceTypedChainId] = provingLeaves.map((leaf) => {
        return hexToU8a(leaf);
      });
    }

    // Validate that the commitment is in the tree
    const utxo = await utxoFromVAnchorNote(note.note);

    return {
      leafIndex: -1,
      utxo,
      amount: amountBN,
    };
  }

  private async getVAnchorPalletId(api: ApiPromise): Promise<number> {
    const metadata = await api.rpc.state.getMetadata();
    return metadata.asLatest.pallets.findIndex((pallet) => {
      return pallet.name.toString() === 'VAnchorBn254';
    });
  }
}
