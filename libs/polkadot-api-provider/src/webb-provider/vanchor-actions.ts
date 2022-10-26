import { VAnchorActions } from '@nepoche/abstract-api-provider/anchor/vanchor-actions';
import { Keypair, Note } from '@webb-tools/sdk-core';

import { WebbPolkadot } from '../webb-provider';

export class PolkadotVAnchorActions extends VAnchorActions<WebbPolkadot> {
  async isPairRegistered(treeId: string, account: string, pubkey: string): Promise<boolean> {
    return true;
  }

  async register(treeId: string, account: string, pubkey: string): Promise<boolean> {
    throw new Error('Attempted to register with Polkadot');
  }

  async syncNotesForKeypair(anchorAddress: string, owner: Keypair): Promise<Note[]> {
    throw new Error('Attempted to sync notes for keypair with Polkadot');
  }
}
