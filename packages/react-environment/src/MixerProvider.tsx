import React, { ReactNode, FC, useState, useEffect, useCallback } from 'react';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import { useApi } from '@webb-dapp/react-hooks';

export interface MixerContextData {
  init: () => Promise<Mixer>;
  mixerGroups: MixerAssetGroup[];
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
  const { api, connected } = useApi();
  const [mixerGroups, setMixerGroups] = useState<MixerAssetGroup[]>([]);

  useEffect(() => {
    if (!connected) return;

    api.query.mixer.mixerGroups.entries().subscribe((result) => {
      result.map(([key, value]) => {
        console.log({ key, value });
      });
    });

    setMixerGroups([]);
  }, [api, connected]);

  const init = useCallback(() => Mixer.init(mixerGroups), [mixerGroups]);

  return (
    <MixerContext.Provider
      value={{
        mixerGroups,
        init,
      }}
    >
      {children}
    </MixerContext.Provider>
  );
};
