import { useCall } from '@webb-dapp/react-hooks';
import { MixerInfo, ScalarData } from '@webb-tools/types/interfaces';
import { useMemo } from 'react';

/**
 * Class representing {MixerInfo} with a native js types
 * */
class MixerInfoWrapper {
  constructor(private _inner?: MixerInfo) {}

  get inner() {
    return this._inner;
  }

  /**
   * Tell wither  inner type exists or not
   * */
  get ready() {
    return Boolean(this.inner);
  }
}

/**
 * UseMixerInfos
 *  @description   This will issue an RPC call to query.mixer.mixerGroups
 *   @param {string} id which is the GroupId is optional if the is undefined the underlying rpc call won't take place
 *
 *
 *  @return {MixerInfoWrapper}
 * */
export const useMixerInfo = (id?: string | undefined): MixerInfoWrapper => {
  const mixerInfo = useCall<MixerInfo>('query.mixer.mixerTrees', [id], undefined, undefined, () => Boolean(id));
  return useMemo(() => {
    return new MixerInfoWrapper(mixerInfo);
  }, [mixerInfo]);
};
