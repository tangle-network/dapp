import { MixerAssetGroup } from '@webb-tools/sdk-mixer';

export class MixerGroupIdsWrapper {
  constructor(private _inner?: any[]) {}

  get inner() {
    return this._inner || [];
  }

  get ids() {
    return this.inner.map((id) => Number(id.toString()));
  }

  assetGroups(tokenSymbol = 'EDG', treeDepth = 32): MixerAssetGroup[] {
    return this.inner.map((id) => new MixerAssetGroup(Number(id.toString()), tokenSymbol as any, treeDepth));
  }
}
