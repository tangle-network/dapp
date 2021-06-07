import { useCall } from '@webb-dapp/react-hooks';
import { MerkleTree } from '@webb-tools/types/interfaces';
import { ScalarData } from '@webb-tools/types/interfaces/mixer';
import { useMemo } from 'react';

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

/**
 * UseGroupTrees
 *  @description   This will issue an RPC call to query.merkle.groups
 *  @param {string} id which is the GroupId is optional if the is undefined the underlying rpc call won't take place
 *  @return {GroupTreeWrapper}
 * */
export const useGroupTree = (id?: string | undefined): GroupTreeWrapper => {
  const groupTree = useCall<MerkleTree>('query.merkle.trees', [id], undefined, undefined, () => Boolean(id));
  return useMemo(() => {
    return new GroupTreeWrapper(groupTree);
  }, [groupTree]);
};
