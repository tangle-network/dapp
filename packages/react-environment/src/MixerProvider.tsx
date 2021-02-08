import { useApi, useCall } from '@webb-dapp/react-hooks';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import React, { FC, ReactNode, useCallback, useEffect } from 'react';

import { Bool } from '@polkadot/types';

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
  const initialized = useCall<Bool>('query.mixer.initialised', []);
  const { api, connected } = useApi();

  console.log('Mixer Initialised? ', initialized);
  useEffect(() => {
    if (initialized?.isTrue || !connected) return;
    api.tx.mixer.initialize().send().toPromise().then(console.log).catch(console.error);
  }, [initialized, api, connected]);

  const groupsIds = useCall<number[]>('query.mixer.mixerGroupIds', []);

  console.log({ groupsIds });
  const init = useCallback(() => {
    return Mixer.init([new MixerAssetGroup(0, 'EDG', 32)]);
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
