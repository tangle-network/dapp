import { useContext } from 'react';

import { MixerContext, MixerContextData } from '@webb-dapp/react-environment';

/**
 * @name useMixer
 * @description get Mixer context value
 */
export const useMixer = (): MixerContextData => {
  return useContext<MixerContextData>(MixerContext);
};
