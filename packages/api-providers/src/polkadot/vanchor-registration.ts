import { VAnchorRegistration } from '../abstracts/anchor/vanchor-registration';
import { WebbPolkadot } from './webb-provider';

export class PolkadotVAnchorRegistration extends VAnchorRegistration<WebbPolkadot> {
  async isPairRegistered(treeId: string, account: string, pubkey: string): Promise<boolean> {
    throw new Error('Attempted to check registration with Polkadot');
  }

  async register(treeId: string, account: string, pubkey: string): Promise<boolean> {
    throw new Error('Attempted to register with Polkadot');
  }
}
