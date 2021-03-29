import { useCall } from '@webb-dapp/react-hooks';
import { MixerAssetGroup } from '@webb-tools/sdk-mixer';
import { GroupId } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';

class MixerGroupIdsWrapper {
  constructor(private _inner?: GroupId[]) {}

  get inner() {
    return this._inner || [];
  }

  get ids() {
    return this.inner.map((id) => Number(id.toString()));
  }

  // todo fix TokenSymbol type
  // @ts-ignore
  assetGroups(tokenSymbol = 'EDG', treeDepth = 32): MixerAssetGroup[] {
    return this.inner.map((id) => new MixerAssetGroup(Number(id.toString()), tokenSymbol as any, treeDepth));
  }
}

export const useMixerGroupIds = (): MixerGroupIdsWrapper => {
  const groupIds = useCall<GroupId[]>('query.mixer.mixerGroupIds', []);
  return useMemo(() => {
    return new MixerGroupIdsWrapper(groupIds);
  }, [groupIds]);
};
