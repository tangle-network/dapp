import './initI18n';

import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import { NotificationStacked } from '@webb-dapp/ui-components/notification';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC } from 'react';
import { hot } from 'react-hot-loader/root';

import { config as routerConfig } from './router-config';
import { u8aToHex } from '@polkadot/util';
import { decodeAddress } from '@polkadot/keyring';
async function fetchSubstratePK() {
  const req = await fetch('/sub-fixtures/proving_key.bin');
  const res = await req.arrayBuffer();
  const ua = new Uint8Array(res);
  console.log(u8aToHex(ua));
  return ua;
}
fetchSubstratePK();
const appLogger = LoggerService.new('App');
console.log(u8aToHex(decodeAddress('jn5LuB5d51srpmZqiBNgWu11C6AeVxEygggjWsifcG1myqr')), 'hex');
const App: FC = () => {
  return (
    <DAppError logger={appLogger}>
      <WebbProvider applicationName={'Webb DApp'}>
        <UIProvider>
          <Theme />

          <RouterProvider config={routerConfig} />
          <NotificationStacked />
        </UIProvider>
      </WebbProvider>
    </DAppError>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
