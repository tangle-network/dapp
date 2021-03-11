import { useCall } from '@webb-dapp/react-hooks';
import { GroupTree } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';
import { hexToU8a } from '@polkadot/util';

class MerkleGroupWrapper {
  constructor(private _inner?: GroupTree) {}

  get inner() {
    return this._inner;
  }

  get ready() {
    return Boolean(this.inner);
  }

  get rootHash() {
    return this.inner?.toHuman().root_hash ?? null;
  }

  get rootHashU8a(): Uint8Array | null {
    const rootHash = this.rootHash;
    return rootHash ? hexToU8a(rootHash as any) : null;
  }
}

export const useMerkleGroups = (id?: string | undefined) => {
  const groupTree = useCall<GroupTree>('query.merkle.groups', [id], undefined, undefined, () => Boolean(id));
  return useMemo(() => {
    return new MerkleGroupWrapper(groupTree);
  }, [groupTree]);
};
