import { useAccounts, useApi, useCall } from '@webb-dapp/react-hooks';
import { Mixer, MixerAssetGroup } from '@webb-tools/sdk-mixer';
import React, { FC, ReactNode, useCallback, useEffect, useState } from 'react';

export interface MixerContextData {
  init: () => Promise<Mixer>;
}

// ensure that mixer always exist
export const MixerContext = React.createContext<MixerContextData>({} as MixerContextData);

interface Props {
  groupId?: number;
  children: ReactNode;
}

/**
 * @name MixerProvider
 * @description context provider to support mixer.
 */
export const MixerProvider: FC<Props> = ({ children, groupId = 0 }) => {
  const initialized = useCall<boolean>('query.mixer.initialised', []);
  const { api } = useApi();

  console.log('Mixer Initialised? ', initialized);
  useEffect(() => {
    if (initialized) return;
    api.tx.mixer.initialize().send().toPromise().then(console.log).catch(console.error);
  }, [initialized, api.tx.mixer]);
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
