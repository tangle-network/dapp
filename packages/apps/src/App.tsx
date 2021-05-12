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
import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';

const appLogger = LoggerService.new('App');
const App: FC = () => {
  useEffect(() => {
    const run = async () => {
      if (!window) {
        return;
      }
      ;


    };

    run();
  }, []);
  /*return <button onClick={async() => {
    const ethMetaMask = Web3Provider.fromExtension();
    const provider = ethMetaMask.intoEthersProvider();
    const accounts = await ethMetaMask.eth.getAccounts()
    const wallet = new Wallet(accounts[0] , provider);
    const address = '0x2ab21881E3774BcEE22F3B11dee7BffAa2EcB5F5';
    const anchorContract = new AnchorContract(wallet , address);
    const lastRoot = await anchorContract.getLastRoot;
    console.log(lastRootk);

  }
  }>connect</button>;

   */
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
