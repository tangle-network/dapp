import { MixerContext, MixerContextData } from '@webb-dapp/react-environment';
import { useCall } from '@webb-dapp/react-hooks/useCall';
import { MixerAssetGroup } from '@webb-tools/sdk-mixer';
import { GroupId } from '@webb-tools/types/interfaces';
import { useContext, useMemo } from 'react';
import { useFeatures } from '@webb-dapp/react-hooks/useFeatures';

/**
 * @name useMixer
 * @description get Mixer context value
 */
export const useMixerProvider = (): MixerContextData => {
  return useContext<MixerContextData>(MixerContext);
};

export const useMixerGroups = (): MixerAssetGroup[] => {
  const mixerGroupIds = useCall<Array<GroupId>>('query.mixer.mixerGroupIds', []);

  return useMemo(() => {
    return (
      mixerGroupIds?.map((id) => {
        return new MixerAssetGroup(Number(id.toString()), 'EDG', 32);
      }) ?? []
    );
  }, [mixerGroupIds]);
};
