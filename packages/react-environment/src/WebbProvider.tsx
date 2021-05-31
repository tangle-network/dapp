import { DimensionsProvider } from '@webb-dapp/react-environment/layout';
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
            <DimensionsProvider>{children}</DimensionsProvider>
          </StoreProvier>
        </ExtensionProvider>
      </ApiProvider>
    </SettingProvider>
  );
};
