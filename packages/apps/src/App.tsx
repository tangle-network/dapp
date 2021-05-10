import './initI18n';

import { EventsWatcher } from '@webb-dapp/react-components';
import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC, useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import {   providers ,Wallet } from 'ethers';
import { config as routerConfig } from './router-config';
import { Web3Provider } from '../../wallet/src/providers/web3/web3-provider';

const appLogger = LoggerService.new('App');
const App: FC = () => {
  useEffect(() => {
    const run = async () => {
      const address = '0x2ab21881E3774BcEE22F3B11dee7BffAa2EcB5F5';
      if (!window) {
        return;
      }
      ;


    };

    run();
  }, []);
  return <button onClick={async() => {
    const ethMetaMask = Web3Provider.fromExtension();
    const provider = new providers.Web3Provider(ethMetaMask.provider);
    const accounts = await ethMetaMask.eth.getAccounts()
    const wallet = new Wallet(accounts[0] , provider);
    const balance = await wallet.getBalance()
    console.log(balance);
  }
  }>connect</button>;
  return (
    <DAppError logger={appLogger}>
      <WebbProvider applicationName={'Webb DApp'}>
        <UIProvider>
          <Theme />
          <RouterProvider config={routerConfig} />
          <EventsWatcher />
        </UIProvider>
      </WebbProvider>
    </DAppError>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
