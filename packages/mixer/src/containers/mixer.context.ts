import { Mixer } from '@webb-tools/sdk-mixer';
import React from 'react';

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
