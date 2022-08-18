import { VAnchorRegistration } from '../abstracts/anchor/vanchor-registration';
import { registrationStorageFactory } from '../utils';
import { WebbWeb3Provider } from './webb-provider';

export class Web3VAnchorRegistration extends VAnchorRegistration<WebbWeb3Provider> {
  // Check if the evm address and public key pairing has already registered.
  async isPairingRegistered(anchorAddress: string, account: string, pubkey: string): Promise<boolean> {
    console.log(`anchorAddress: ${anchorAddress} \n account: ${account} \n pubkey: ${pubkey}`);
    // Check the localStorage for now.
    // TODO: Implement a query on relayers?
    const registration = await registrationStorageFactory(account);
    const registeredPubkeys = await registration.get(anchorAddress);
    console.log('registered pubkeys: ', registeredPubkeys);
    if (registeredPubkeys && registeredPubkeys.find((key) => key === pubkey) != undefined) {
      return true;
    }
    return false;
  }

  async register(anchorAddress: string, account: string, pubkey: string): Promise<boolean> {
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
      await vanchor.register(account, pubkey);
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
      registeredPubkeys.push(pubkey);
    } else {
      registeredPubkeys = [pubkey];
    }
    await registration.set(anchorAddress, registeredPubkeys);

    return true;
  }
}
