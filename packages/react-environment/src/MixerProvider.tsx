import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import { useApi } from '@webb-dapp/react-hooks';
import { notification } from '@webb-dapp/ui-components';
// @ts-ignore
import Worker from './mixer/mixer.worker';
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
    try {
      api.query.mixer.mixerGroups.entries().subscribe((result) => {
        result.map(([key, value]) => {
          console.log({ key, value });
        });
      });
    } catch (e) {
      notification.open({
        className: 'error',
        message: (
          <div>
            <p>{`Please connect to Anon local node , to initialize the Mixer`}</p>
          </div>
        ),
      });
    }

    setMixerGroups([]);
  }, [api, connected]);

  const init = useCallback(() => Mixer.init(new Worker(), mixerGroups), [mixerGroups]);

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
