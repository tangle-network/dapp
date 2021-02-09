import { AppSettings, ConnectStatus } from '@webb-dapp/react-components';
import { MixerProvider } from '@webb-dapp/react-environment/MixerProvider';
import { BareProps } from '@webb-dapp/ui-components/types';
import React, { FC } from 'react';

import { ApiProvider } from './ApiProvider';
import { ExtensionProvider } from './ExtensionProvider';
import { SettingProvider } from './SettingProvider';
import { StoreProvier } from './store';

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
