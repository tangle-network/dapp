import { decodeAddress, naclEncrypt, randomAsU8a } from '@polkadot/util-crypto';
import {
  ActiveWebbRelayer,
  FixturesStatus,
  isVAnchorDepositPayload,
  NewNotesTxResult,
  ParametersOfTransactMethod,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import {
  ArkworksProvingManager,
  FIELD_SIZE,
  Keypair,
  LeafIdentifier,
  Note,
  ProvingManagerSetupInput,
  randomBN,
  Utxo,
  VAnchorProof,
} from '@webb-tools/sdk-core';
import { hexToU8a, u8aToHex } from '@webb-tools/utils';
import BN from 'bn.js';
import { formatUnits } from 'ethers/lib/utils';
import { firstValueFrom } from 'rxjs';
import { getLeafIndex } from '../mt-utils';

import { PolkadotTx } from '../transaction';
import { WebbPolkadot } from '../webb-provider';

export class PolkadotVAnchorActions extends VAnchorActions<WebbPolkadot> {
  prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapAssetId: string
  ): Promise<ParametersOfTransactMethod> | never {
    tx.next(TransactionState.PreparingTransaction, undefined);
    if (isVAnchorDepositPayload(payload)) {
      return this.prepareDepositTransaction(tx, payload, wrapUnwrapAssetId);
    }

    throw new Error('Unsupported payload type');
  }

  transactWithRelayer(
    activeRelayer: ActiveWebbRelayer,
    txArgs: ParametersOfTransactMethod,
    changeNotes: Note[]
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async transact(
    tx: Transaction<NewNotesTxResult>,
    treeId: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BN,
    refund: BN,
    recipient: string,
    relayer: string,
    wrapUnwrapAssetId: string,
    leavesMap: Record<string, Uint8Array[]>
  ) {
    // Get active bridge and currency fungible asset
    const activeBridge = this.inner.state.activeBridge;
    if (!activeBridge) {
      throw WebbError.from(WebbErrorCodes.ApiNotReady);
    }

    const fungibleAsset = activeBridge.currency;
    const fungibleAssetId = fungibleAsset.getAddress(this.inner.typedChainId);
    if (!fungibleAssetId) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    // Get active account
    const activeAccount = await this.inner.accounts.activeOrDefault;
    if (!activeAccount) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    // 16 inputs and 2 outputs
    inputs = await this.padUtxos(inputs, 16);
    outputs = await this.padUtxos(outputs, 2);

    const { extAmount, extData, vanchorProofData } =
      await this.setupTransaction(
        tx,
        inputs,
        outputs,
        fee,
        refund,
        recipient,
        relayer,
        wrapUnwrapAssetId,
        leavesMap,
        treeId
      );

    tx.next(
      TransactionState.SendingTransaction,
      'Sending transaction to vanchor'
    );

    // now we call the vanchor transact on substrate
    let polkadotTx: PolkadotTx<any[]>;

    if (wrapUnwrapAssetId !== fungibleAssetId) {
      let method: string;
      if (tx.name === 'Deposit') {
        method = 'wrap';
      } else if (tx.name === 'Withdraw') {
        method = 'unwrap';
      } else {
        throw new Error(`${tx.name} is not supported wrap/unwrap`);
      }

      // Perform a wrap/unwrap
      polkadotTx = this.inner.txBuilder.build(
        [
          {
            method,
            section: 'tokenWrapper',
          },
          {
            method: 'transact',
            section: 'vAnchorBn254',
          },
        ],
        [
          [
            wrapUnwrapAssetId,
            fungibleAssetId,
            extAmount,
            activeAccount.address,
          ],
          [treeId, vanchorProofData, extData],
        ]
      );
    } else {
      polkadotTx = this.inner.txBuilder.build(
        {
          method: 'transact',
          section: 'vAnchorBn254',
        },
        [treeId, vanchorProofData, extData]
      );
    }

    const txHash: string = await polkadotTx.call(activeAccount.address);

    return {
      transactionHash: txHash,
    };
  }

  async isPairRegistered(
    treeId: string,
    account: string,
    pubkey: string
  ): Promise<boolean> {
    return true;
  }

  async register(
    treeId: string,
    account: string,
    pubkey: string
  ): Promise<boolean> {
    throw new Error('Attempted to register with Polkadot');
  }

  async syncNotesForKeypair(
    anchorAddress: string,
    owner: Keypair
  ): Promise<Note[]> {
    throw new Error('Attempted to sync notes for keypair with Polkadot');
  }

  /**
   * A function to get the leaf index of a leaf in the tree
   * @param leaf the leaf to search for
   * @param indexBeforeInsertion the tree index before insertion
   * @param addressOrTreeId the address or tree id of the tree
   */
  async getLeafIndex(
    leaf: Uint8Array,
    indexBeforeInsertion: number,
    addressOrTreeId: string
  ): Promise<bigint> {
    const treeId = Number(addressOrTreeId);
    const idx = await getLeafIndex(
      this.inner.api,
      leaf,
      indexBeforeInsertion,
      treeId
    );
    return BigInt(idx);
  }

  async getNextIndex(
    typedChainId: number,
    fungibleCurrencyId: number
  ): Promise<bigint> {
    const chain = this.inner.config.chains[typedChainId];
    const treeIdStr = this.inner.config.getAnchorAddress(
      fungibleCurrencyId,
      typedChainId
    );

    if (!chain || !treeIdStr) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const treeId = Number(treeIdStr);
    if (isNaN(treeId)) {
      throw WebbError.from(WebbErrorCodes.NoFungibleTokenAvailable);
    }

    const nextIdx = await this.inner.api.query.merkleTreeBn254.nextLeafIndex(
      treeId
    );
    return nextIdx.toBigInt();
  }

  private async prepareDepositTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: Note,
    wrapUnwrapAssetId: string
  ): Promise<ParametersOfTransactMethod> {
    const activeAccount = await this.inner.accounts.activeOrDefault;
    if (!activeAccount) {
      throw new Error('No active account');
    }

    await this.checkHasBalance(payload, wrapUnwrapAssetId);

    const address = activeAccount.address;
    const zeroBN = new BN(0);

    const secrets = payload.note.secrets.split(':');
    const depositUtxo = await Utxo.generateUtxo({
      curve: payload.note.curve,
      backend: 'Arkworks', // Update this in the generateNote method in subsequent PR
      amount: payload.note.amount,
      originChainId: payload.note.sourceChainId.toString(),
      chainId: payload.note.targetChainId.toString(),
      keypair: new Keypair(`0x${secrets[2]}`),
      blinding: hexToU8a(`0x${secrets[3]}`),
    });
    const inputUtxos: Utxo[] = [];

    const leavesMap: Record<number, Uint8Array[]> = {};

    leavesMap[+payload.note.sourceChainId] = [];

    return [
      tx,
      payload.note.sourceIdentifyingData,
      inputUtxos,
      [depositUtxo],
      zeroBN,
      zeroBN,
      address,
      address,
      wrapUnwrapAssetId,
      leavesMap,
    ] satisfies ParametersOfTransactMethod;
  }

  private async checkHasBalance(payload: Note, wrapUnwrapAssetId: string) {
    // Check if the user has enough balance
    const balance = await firstValueFrom(
      this.inner.methods.chainQuery.tokenBalanceByAddress(wrapUnwrapAssetId)
    );

    const amount = formatUnits(payload.note.amount, payload.note.denomination);

    if (Number(balance) < Number(amount)) {
      this.emit('stateChange', TransactionState.Failed);
      await this.inner.noteManager?.removeNote(payload);
      throw new Error('Not enough balance');
    }
  }

  /**
   * Sets up a VAnchor transaction by generate the necessary inputs to the tx.
   * @param inputs a list of UTXOs that are either inside the tree or are dummy inputs
   * @param outputs a list of output UTXOs. Needs to have 2 elements.
   * @param fee transaction fee.
   * @param refund amount given as gas to withdraw address
   * @param recipient address to the recipient
   * @param relayer address to the relayer
   * @param wrapUnwrapAssetId address to the token being transacted. can be the empty string to use native token
   * @param leavesMap map from chainId to merkle leaves
   * @param treeId the treeId of the tree being used
   */
  private async setupTransaction(
    tx: Transaction<NewNotesTxResult>,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BN,
    refund: BN,
    recipient: string,
    relayer: string,
    wrapUnwrapAssetId: string,
    leavesMap: Record<string, Uint8Array[]>,
    treeId: string
  ) {
    if (wrapUnwrapAssetId.length === 0) {
      throw new Error('No asset id provided');
    }

    if (outputs.length !== 2) {
      throw new Error('Only two outputs are supported');
    }

    const api = this.inner.getProvider().api;

    const sourceTypedChainId = this.inner.typedChainId;
    const tree = await api.query.merkleTreeBn254.trees(treeId);
    const root = tree.unwrap().root.toHex();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const neighborRoots: string[] = await api.rpc.lt
      .getNeighborRoots(treeId)
      .then((roots) => roots.toHuman());

    const rootsSet = [hexToU8a(root), hexToU8a(neighborRoots[0])];
    const extAmount = this.getExtAmount(inputs, outputs, fee);

    // calculate the sum of input notes (for calculating the public amount)
    let sumInputUtxosAmount = new BN(0);

    // Pass the identifier for leaves alongside the proof input
    const leafIds: LeafIdentifier[] = [];

    for (const inputUtxo of inputs) {
      sumInputUtxosAmount = sumInputUtxosAmount.add(new BN(inputUtxo.amount));
      leafIds.push({
        index: inputUtxo.index ?? this.inner.state.defaultUtxoIndex,
        typedChainId: Number(inputUtxo.originChainId),
      });
    }

    const secret = randomAsU8a();
    const encryptedCommitments: [Uint8Array, Uint8Array] = [
      naclEncrypt(outputs[0].commitment, secret).encrypted,
      naclEncrypt(outputs[1].commitment, secret).encrypted,
    ];

    const fixturesList = new Map<string, FixturesStatus>();
    tx.next(TransactionState.FetchingFixtures, { fixturesList });

    fixturesList.set('vanchor key', 'Waiting');
    const maxEdges = await this.inner.getVAnchorMaxEdges(treeId);
    const zkey = await this.inner.getZkVAnchorKey(maxEdges, inputs.length <= 2);
    fixturesList.set('vanchor key', 'Done');

    tx.next(TransactionState.GeneratingZk, undefined);
    const fieldSize = new BN(FIELD_SIZE.toString());
    const assetIdBytes = hexToU8a(Number(wrapUnwrapAssetId).toString(16));
    const amount = extAmount.sub(fee).add(fieldSize).mod(fieldSize).toString();

    const proofInput: ProvingManagerSetupInput<'vanchor'> = {
      inputUtxos: inputs,
      leavesMap,
      leafIds,
      roots: rootsSet,
      chainId: sourceTypedChainId.toString(),
      output: [outputs[0], outputs[1]],
      encryptedCommitments,
      publicAmount: amount,
      provingKey: zkey,
      relayer: decodeAddress(relayer),
      recipient: decodeAddress(recipient),
      extAmount: amount,
      fee: fee.toString(),
      refund: refund.toString(),
      token: assetIdBytes,
    };

    const pm = new ArkworksProvingManager(null); // No worker needed for now.
    const data: VAnchorProof = await pm.prove('vanchor', proofInput);

    const extData = {
      relayer,
      recipient,
      fee: fee.toString(),
      refund: refund.toString(),
      token: assetIdBytes,
      extAmount: extAmount,
      encryptedOutput1: u8aToHex(encryptedCommitments[0]),
      encryptedOutput2: u8aToHex(encryptedCommitments[1]),
    };

    const vanchorProofData = {
      proof: `0x${data.proof}` as const,
      publicAmount: data.publicAmount,
      roots: rootsSet,
      inputNullifiers: data.inputUtxos.map(
        (input) => `0x${input.nullifier}` as const
      ),
      outputCommitments: data.outputUtxos.map((utxo) => utxo.commitment),
      extDataHash: data.extDataHash,
    };

    return {
      extData,
      extAmount,
      vanchorProofData,
    };
  }

  // https://github.com/webb-tools/protocol-solidity/blob/65d8e7ca7b7ba227d8cd97f2773fefc378655944/packages/anchors/src/Common.ts#L194-L198
  private getExtAmount(inputs: Utxo[], outputs: Utxo[], fee: BN) {
    return new BN(fee)
      .add(outputs.reduce((sum, x) => sum.add(new BN(x.amount)), new BN(0)))
      .sub(inputs.reduce((sum, x) => sum.add(new BN(x.amount)), new BN(0)));
  }

  // https://github.com/webb-tools/protocol-solidity/blob/65d8e7ca7b7ba227d8cd97f2773fefc378655944/packages/anchors/src/Common.ts#L247-L269
  private async padUtxos(utxos: Utxo[], maxLen: number): Promise<Utxo[]> {
    const typedChainId = this.inner.typedChainId;
    const randomKeypair = new Keypair();

    while (utxos.length !== 2 && utxos.length < maxLen) {
      utxos.push(
        await Utxo.generateUtxo({
          curve: 'Bn254',
          backend: 'Arkworks',
          chainId: typedChainId.toString(),
          originChainId: typedChainId.toString(),
          amount: '0',
          blinding: hexToU8a(randomBN(31).toHexString()),
          keypair: randomKeypair,
        })
      );
    }
    if (utxos.length !== 2 && utxos.length !== maxLen) {
      throw new Error('Invalid utxo length');
    }
    return utxos;
  }
}
