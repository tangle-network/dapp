import React, { FC } from 'react';

import { ConnectStatus, AppSettings } from '@webb-dapp/react-components';
import { BareProps } from '@webb-dapp/ui-components/types';

import { ApiProvider } from './ApiProvider';
import { SettingProvider } from './SettingProvider';
import { StoreProvier } from './store';
import { ExtensionProvider } from './ExtensionProvider';
import { MixerProvider } from '@webb-dapp/react-environment/MixerProvider';

interface WebbProviderProps extends BareProps {
  applicationName: string;
  applicationVersion?: string;
}

export const WebbProvider: FC<WebbProviderProps> = ({ applicationName = 'Webb Dapp', children }) => {
  return (
    <SettingProvider>
      <ApiProvider>
        <ExtensionProvider appName={applicationName}>
          <StoreProvier>
            <MixerProvider>
              {children}
              <ConnectStatus />
              <AppSettings />
            </MixerProvider>
          </StoreProvier>
        </ExtensionProvider>
      </ApiProvider>
    </SettingProvider>
  );
};
