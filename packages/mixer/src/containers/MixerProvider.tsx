import { useMixer } from '@webb-dapp/react-hooks';
import React, { FC, ReactNode } from 'react';

import { MixerContext } from './mixer.context';

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
