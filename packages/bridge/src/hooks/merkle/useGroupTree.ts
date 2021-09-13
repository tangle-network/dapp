import { MerkleTree } from '@webb-tools/types/interfaces';
import { ScalarData } from '@webb-tools/types/interfaces/mixer';

import { hexToU8a } from '@polkadot/util';

/**
 * Class representing {GroupTree} with a native js types
 * */
export class GroupTreeWrapper {
  constructor(private _inner?: MerkleTree) {}

  get inner() {
    return this._inner;
  }

  /**
   * Tell wither  inner type exists or not
   * */
  get ready() {
    return Boolean(this.inner);
  }

  /**
   * Get the root hash for the GroupTree
   * This should be called if the inner type dose exists other wise it will return null
   * */
  get rootHash(): ScalarData | null {
    return (this.inner?.toHuman().root_hash as ScalarData | null) ?? null;
  }

  /**
   * Get the root hash for the GroupTree
   * This should be called if the inner type dose exists other wise it will return null
   * */
  get rootHashU8a(): Uint8Array | null {
    const rootHash = this.rootHash;
    return rootHash ? hexToU8a(rootHash as any) : null;
  }
}
