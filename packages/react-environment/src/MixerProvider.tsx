import { useMixer } from '@webb-dapp/react-hooks';
import { Mixer } from '@webb-tools/sdk-mixer';
import React, { FC, ReactNode } from 'react';

export interface MixerContextData {
  initialized: boolean;
  loading: boolean;
  mixer: Mixer | null;
  shouldDestroy: false;
  init(): Promise<void>;
  generatingBP: boolean;
  restarting: boolean;
  restart(): Promise<void>;
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
  const mixerResults = useMixer();

  return <MixerContext.Provider value={mixerResults}>{children}</MixerContext.Provider>;
};
