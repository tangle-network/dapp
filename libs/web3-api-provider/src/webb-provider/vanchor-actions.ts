import {
  CancellationToken,
  FixturesStatus,
  NewNotesTxResult,
  Transaction,
  TransactionState,
  VAnchorActions,
} from '@webb-tools/abstract-api-provider';
import {
  VAnchor,
} from '@webb-tools/anchors';
import { registrationStorageFactory } from '@webb-tools/browser-utils/storage';
import { fetchVAnchorKeyFromAws, fetchVAnchorWasmFromAws } from '@webb-tools/fixtures-deployments';
import { buildVariableWitnessCalculator, Keypair, Note, Utxo } from '@webb-tools/sdk-core';
import { ZkComponents } from '@webb-tools/utils';
import { BigNumberish } from 'ethers';

import { WebbWeb3Provider } from '../webb-provider';

export class Web3VAnchorActions extends VAnchorActions<WebbWeb3Provider> {
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
      console.log('Registration failed: ', ex);
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
