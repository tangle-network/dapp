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
  return <button onClick={async () => {
    const ethMetaMask = Web3Provider.fromExtension();
    const provider = ethMetaMask.intoEthersProvider();
    const address = '0x876eCe69618e8E8dd743250B036785813824D2D7';
    const accounts = await ethMetaMask.eth.getAccounts();
    if (accounts.length) {

      const balance = await ethMetaMask.eth.getBalance(accounts[0]);
      console.log(balance);

      const anchorContract = new AnchorContract(provider.getSigner(), address);
      const deposit = anchorContract.createDeposit();
      const tx = await anchorContract.deposit(deposit.commitment, event => {
        console.log({ event });
      });
      const res = await tx.wait();
      console.log(res);
    }


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
