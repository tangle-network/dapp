import { MixerContext, MixerContextData } from '@webb-dapp/react-environment';
import { useContext } from 'react';

/**
 * @name useMixer
 * @description get Mixer context value
 */
export const useMixer = (): MixerContextData => {
  return useContext<MixerContextData>(MixerContext);
};
