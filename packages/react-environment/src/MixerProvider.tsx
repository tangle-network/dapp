import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import React, { FC, ReactNode, useCallback } from 'react';

// @ts-ignore
import Worker from './mixer/mixer.worker';

export interface MixerContextData {
  // eslint-disable-next-line no-unused-vars
  init(mixerGroups: MixerAssetGroup[]): Promise<Mixer>;
}

// ensure that mixer always exist
export const MixerContext = React.createContext<MixerContextData>({} as MixerContextData);

interface Props {
  children: ReactNode;
}

/**
 * @name MixerProvider
 * @description context provider to support mixer.
 */
export const MixerProvider: FC<Props> = ({ children }) => {
  const init = useCallback((mixerGroups: MixerAssetGroup[]) => {
    return Mixer.init(new Worker(), mixerGroups);
  }, []);

  return (
    <MixerContext.Provider
      value={{
        init,
      }}
    >
      {children}
    </MixerContext.Provider>
  );
};
