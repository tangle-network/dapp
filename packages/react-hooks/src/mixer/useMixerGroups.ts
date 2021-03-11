import { useCall } from '@webb-dapp/react-hooks';
import { MixerInfo, ScalarData } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';

class MixerGroupWrapper {
  constructor(private _inner?: MixerInfo) {}

  get inner() {
    return this._inner;
  }

  get ready() {
    return Boolean(this.inner);
  }

  get leaves(): ScalarData[] {
    return this.inner?.leaves.toArray() ?? [];
  }

  get leaveU8a(): Uint8Array[] {
    return this.leaves.map((leaf) => leaf.toU8a());
  }
}

export const useMixerGroups = (id?: string | undefined) => {
  const groupTree = useCall<MixerInfo>('query.mixer.mixerGroups', [id], undefined, undefined, () => Boolean(id));
  return useMemo(() => {
    return new MixerGroupWrapper(groupTree);
  }, [groupTree]);
};
