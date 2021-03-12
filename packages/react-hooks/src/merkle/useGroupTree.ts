import { useCall } from '@webb-dapp/react-hooks';
import { GroupTree } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';
import { hexToU8a } from '@polkadot/util';

/**
 * Class representing {GroupTree} with a native js types
 * */
class GroupTreeWrapper {
  constructor(private _inner?: GroupTree) {}

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
  get rootHash() {
    return this.inner?.toHuman().root_hash ?? null;
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
export const useGroupTree = (id?: string | undefined) => {
  const groupTree = useCall<GroupTree>('query.merkle.groups', [id], undefined, undefined, () => Boolean(id));
  return useMemo(() => {
    return new GroupTreeWrapper(groupTree);
  }, [groupTree]);
};
