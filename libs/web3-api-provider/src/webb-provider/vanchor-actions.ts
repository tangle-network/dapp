import { CancellationToken, VAnchorActions } from '@nepoche/abstract-api-provider';
import { registrationStorageFactory } from '@nepoche/browser-utils/storage';
import { Keypair, Note } from '@webb-tools/sdk-core';

import { WebbWeb3Provider } from '../webb-provider';

export class Web3VAnchorActions extends VAnchorActions<WebbWeb3Provider> {
  // Check if the evm address and keyData pairing has already registered.
  async isPairRegistered(anchorAddress: string, account: string, keyData: string): Promise<boolean> {
    // Check the localStorage for now.
    // TODO: Implement a query on relayers?
    const registration = await registrationStorageFactory(account);
    const registeredKeydatas = await registration.get(anchorAddress);
    if (registeredKeydatas && registeredKeydatas.find((entry) => entry === keyData) != undefined) {
      return true;
    }
    return false;
  }

  async register(anchorAddress: string, account: string, keyData: string): Promise<boolean> {
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

  async syncNotesForKeypair(anchorAddress: string, owner: Keypair): Promise<Note[]> {
    const cancelToken = new CancellationToken();
    const vanchor = this.inner.getVariableAnchorByAddress(anchorAddress);
    const notes = await this.inner.getVAnchorNotesFromChain(vanchor, owner, cancelToken.abortSignal);
    return notes;
  }
}
