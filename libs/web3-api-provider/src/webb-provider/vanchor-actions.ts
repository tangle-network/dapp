import {
  CancellationToken,
  FixturesStatus,
  NewNotesTxResult,
  Transaction,
  TransactionPayloadType,
  TransactionState,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider';
import {
  VAnchor,
} from '@webb-tools/anchors';
import { registrationStorageFactory } from '@webb-tools/browser-utils/storage';
import { fetchVAnchorKeyFromAws, fetchVAnchorWasmFromAws } from '@webb-tools/fixtures-deployments';
import { buildVariableWitnessCalculator, calculateTypedChainId, ChainType, CircomUtxo, Keypair, Note, NoteGenInput, toFixedHex, Utxo } from '@webb-tools/sdk-core';
import { ZERO_ADDRESS, ZkComponents } from '@webb-tools/utils';
import { BigNumberish, ethers } from 'ethers';

import { WebbWeb3Provider } from '../webb-provider';

export const isVAnchorDepositPayload = (payload: TransactionPayloadType): boolean => {
  return payload instanceof Note;
};

export const isVAnchorWithdrawPayload = (payload: TransactionPayloadType): boolean => {
  return false;
};

export const isVAnchorTransferPayload = (payload: TransactionPayloadType): boolean => {
  return false;
};

export class Web3VAnchorActions extends VAnchorActions<WebbWeb3Provider> {
  async prepareTransaction(
    tx: Transaction<NewNotesTxResult>,
    payload: TransactionPayloadType,
    wrapUnwrapToken: string,
  ): Promise<[
    tx: Transaction<NewNotesTxResult>,
    contractAddress: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BigNumberish,
    refund: BigNumberish,
    recipient: string,
    relayer: string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>
  ]> {
    if (isVAnchorDepositPayload(payload)) {
      const secrets = payload.note.secrets.split(':');
      console.log('secrets', secrets)
      const depositUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: payload.note.amount,
        originChainId: payload.note.sourceChainId.toString(),
        chainId: payload.note.targetChainId.toString(),
        keypair: new Keypair(`0x${secrets[2]}`),
        blinding: Buffer.from(secrets[3]),
      });
      return Promise.resolve([
        tx,                                     // tx
        payload.note.sourceIdentifyingData,     // contractAddress
        [],                                     // inputs
        [depositUtxo],                          // outputs
        0,                                      // fee
        0,                                      // refund
        ZERO_ADDRESS,                           // recipient
        ZERO_ADDRESS,                           // relayer
        wrapUnwrapToken,                        // wrapUnwrapToken
        {},                                     // leavesMap
      ]);
    } else if (isVAnchorWithdrawPayload(payload)) {
      throw new Error('Invalid payload');
    } else if (isVAnchorTransferPayload(payload)) {
      throw new Error('Invalid payload');
    } else {
      throw new Error('Invalid payload');
    }
  }
  async generateNote(vAnchorId: string | number, destTypedChainId: number, amount: number): Promise<Note> {
    this.logger.trace('generateNote: ', vAnchorId, destTypedChainId, amount);
    const bridge = this.inner.methods.bridgeApi.getBridge();
    const currency = bridge?.currency;

    if (!bridge || !currency) {
      this.logger.error('Api not ready');
      throw new Error('api not ready');
    }
    // Convert the amount to bn units (i.e. WEI instead of ETH)
    const bnAmount = ethers.utils
      .parseUnits(amount.toString(), currency.getDecimals())
      .toString();
    const tokenSymbol = currency.view.symbol;
    const sourceEvmId = await this.inner.getChainId();
    const sourceChainId = calculateTypedChainId(ChainType.EVM, sourceEvmId);

    const keypair = this.inner.noteManager
      ? this.inner.noteManager.getKeypair()
      : new Keypair();

    this.logger.info('got the keypair', keypair);

    // Convert the amount to units of wei
    const depositOutputUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: bnAmount,
      originChainId: sourceChainId.toString(),
      chainId: destTypedChainId.toString(),
      keypair,
    });

    this.logger.info('generated the utxo: ', depositOutputUtxo.serialize());

    const srcAddress = bridge.targets[sourceChainId];
    const destAddress = bridge.targets[destTypedChainId];

    const noteInput: NoteGenInput = {
      amount: bnAmount.toString(),
      backend: 'Circom',
      curve: 'Bn254',
      denomination: '18',
      exponentiation: '5',
      hashFunction: 'Poseidon',
      protocol: 'vanchor',
      secrets: [
        toFixedHex(destTypedChainId, 8).substring(2),
        toFixedHex(depositOutputUtxo.amount, 16).substring(2),
        toFixedHex(keypair.privkey).substring(2),
        toFixedHex(`0x${depositOutputUtxo.blinding}`).substring(2),
      ].join(':'),
      sourceChain: sourceChainId.toString(),
      sourceIdentifyingData: srcAddress,
      targetChain: destTypedChainId.toString(),
      targetIdentifyingData: destAddress,
      tokenSymbol: tokenSymbol,
      version: 'v1',
      width: '5',
    };

    this.logger.log('before generating the note: ', noteInput);

    const note = await Note.generateNote(noteInput);

    this.logger.log('after generating the note');

    return note;
  }
  async transact(
    tx: Transaction<NewNotesTxResult>,
    contractAddress: string,
    inputs: Utxo[],
    outputs: Utxo[],
    fee: BigNumberish,
    refund: BigNumberish,
    recipient: string,
    relayer: string,
    wrapUnwrapToken: string,
    leavesMap: Record<string, Uint8Array[]>
  ): Promise<void> {
    const signer = await this.inner.getProvider().getSigner();
    const smallFixtures: ZkComponents = await this.fetchSmallFixtures(tx, 1);
    const dummyFixtures: ZkComponents = { zkey: new Uint8Array(), wasm: Buffer.from(""), witnessCalculator: undefined };
    const vanchor = await VAnchor.connect(contractAddress, smallFixtures, dummyFixtures, signer);
    await vanchor.transact(
      inputs,
      outputs,
      fee,
      refund,
      recipient,
      relayer,
      wrapUnwrapToken,
      leavesMap,
    );
    return;
  }

  async fetchSmallFixtures(tx: Transaction<NewNotesTxResult>, maxEdges: number): Promise<ZkComponents> {
    return this.fetchFixtures(tx, maxEdges, true);
  }

  async fetchLargeFixtures(tx: Transaction<NewNotesTxResult>, maxEdges: number): Promise<ZkComponents> {
    return this.fetchFixtures(tx, maxEdges, false);
  }

  async fetchFixtures(tx: Transaction<NewNotesTxResult>, maxEdges: number, isSmall: boolean): Promise<ZkComponents> {
    this.emit('stateChange', TransactionState.FetchingFixtures);
    const fixturesList = new Map<string, FixturesStatus>();
    fixturesList.set('VAnchorKey', 'Waiting');
    fixturesList.set('VAnchorWasm', 'Waiting');
    tx.next(TransactionState.FetchingFixtures, {
      fixturesList,
    });
    fixturesList.set('VAnchorKey', 0);
    const smallKey = await fetchVAnchorKeyFromAws(
      maxEdges,
      isSmall,
      tx.cancelToken.abortSignal,
    );
    fixturesList.set('VAnchorKey', 'Done');
    fixturesList.set('VAnchorWasm', 0);
    const smallWasm = await fetchVAnchorWasmFromAws(
      maxEdges,
      isSmall,
      tx.cancelToken.abortSignal,
    );
    fixturesList.set('VAnchorWasm', 'Done');

    return {
      zkey: smallKey,
      wasm: Buffer.from(smallWasm),
      witnessCalculator: buildVariableWitnessCalculator,
    }
  }

  // Check if the evm address and keyData pairing has already registered.
  async isPairRegistered(
    anchorAddress: string,
    account: string,
    keyData: string
  ): Promise<boolean> {
    // Check the localStorage for now.
    // TODO: Implement a query on relayers?
    const registration = await registrationStorageFactory(account);
    const registeredKeydatas = await registration.get(anchorAddress);
    if (
      registeredKeydatas &&
      registeredKeydatas.find((entry) => entry === keyData) != undefined
    ) {
      return true;
    }
    return false;
  }

  async register(
    anchorAddress: string,
    account: string,
    keyData: string
  ): Promise<boolean> {
    const vanchor = await this.inner.getVariableAnchorByAddress(anchorAddress);
    this.inner.notificationHandler({
      description: 'Registering Account',
      key: 'register',
      level: 'loading',
      message: 'Registering Account',
      name: 'Transaction',
    });

    try {
      // The user may reject on-chain registration
      await vanchor.register(account, keyData);
    } catch (ex) {
      this.inner.notificationHandler({
        description: 'Account Registration Failed',
        key: 'register',
        level: 'error',
        message: 'Account Registration Failed',
        name: 'Transaction',
      });
      return false;
    }

    this.inner.notificationHandler({
      description: 'Account Registered',
      key: 'register',
      level: 'success',
      message: 'Account Registered',
      name: 'Transaction',
    });

    const registration = await registrationStorageFactory(account);
    let registeredPubkeys = await registration.get(anchorAddress);

    // If there is already a registration localstorage, append.
    if (registeredPubkeys) {
      registeredPubkeys.push(keyData);
    } else {
      registeredPubkeys = [keyData];
    }
    await registration.set(anchorAddress, registeredPubkeys);

    return true;
  }

  async syncNotesForKeypair(
    anchorAddress: string,
    owner: Keypair
  ): Promise<Note[]> {
    const cancelToken = new CancellationToken();
    const vanchor = this.inner.getVariableAnchorByAddress(anchorAddress);
    const notes = await this.inner.getVAnchorNotesFromChain(
      vanchor,
      owner,
      cancelToken.abortSignal
    );
    return notes;
  }
}
