import './initI18n';

import { EventsWatcher } from '@webb-dapp/react-components';
import { NotificationStacked } from '@webb-dapp/ui-components/notification';
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
  return <button onClick={async() => {
    const ethMetaMask = Web3Provider.fromExtension();
    const provider = ethMetaMask.intoEthersProvider();
    const accounts = await ethMetaMask.eth.getAccounts();
    console.log(accounts);
    const wallet = new Wallet(accounts[0] , provider);
    const address ='0x08d9E5634c16F3Db01c559FD5dBaEF1fD441eEAD';
    const anchorContract = new AnchorContract(wallet , address);
    const lastRoot = await anchorContract.getLastRoot;
    console.log(lastRoot);
    let d = await anchorContract.deposit()
    console.log(d);

  }
  }>connect</button>;


  return (
    <DAppError logger={appLogger}>
      <WebbProvider applicationName={'Webb DApp'}>
        <UIProvider>
          <Theme />
          <RouterProvider config={routerConfig} />
          <EventsWatcher />


          <NotificationStacked />
        </UIProvider>
      </WebbProvider>
    </DAppError>
  );
};

export default process.env.NODE_ENV === 'development' ? hot(App) : App;
