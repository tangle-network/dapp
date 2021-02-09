import { useCall } from '@webb-dapp/react-hooks';
import React, { FC, ReactNode, useCallback } from 'react';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
// @ts-ignore
import Worker from './mixer/mixer.worker';

export interface MixerContextData {
  init: () => Promise<Mixer>;
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
  const groupsIds = useCall<number[]>('query.mixer.mixerGroupIds', []);

  console.log({ groupsIds });
  const init = useCallback(() => {
    return Mixer.init(new Worker(), [new MixerAssetGroup(0, 'EDG', 32)]);
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
