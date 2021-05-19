import './initI18n';

import { EventsWatcher } from '@webb-dapp/react-components';
import { NotificationStacked } from '@webb-dapp/ui-components/notification';
import { DAppError } from '@webb-dapp/react-components/utils/Error/DAppError';
import { RouterProvider, WebbProvider } from '@webb-dapp/react-environment';
import { UIProvider } from '@webb-dapp/ui-components';
import Theme from '@webb-dapp/ui-components/styles/Theme';
import { LoggerService } from '@webb-tools/app-util';
import React, { FC, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { config as routerConfig } from './router-config';
import { Web3Provider } from '../../wallet/src/providers/web3/web3-provider';
import { AnchorContract } from '@webb-dapp/contracts/contracts/anchor';
import { downloadString } from '@webb-dapp/utils';
import { EvmNote } from '@webb-dapp/contracts/utils/evm-note';
import { bufferToFixed } from '@webb-dapp/contracts/utils/buffer-to-fixed';
import { pedersenHash } from '@webb-dapp/contracts/utils/pedersen-hash';

const appLogger = LoggerService.new('App');
const App: FC = () => {
  const [note, setNote] = useState(
    'anchor-eth-0.1-4-0x6809a54f1bd376ffcf7710efba67954dfda75cd1f2d419a1a1cfcbac04901e146e6d4442280c4b00e5cf1e61c6745631a2a693973e09347761443bae6a35'
  );
  useEffect(() => {
    const run = async () => {
      if (!window) {
        return;
      }
    };

    run();
  }, []);
  const evmNote = EvmNote.deserialize(note);
  return (
    <div>
      <button
        onClick={async () => {
          const ethMetaMask = Web3Provider.fromExtension();
          const provider = ethMetaMask.intoEthersProvider();
          const address = '0x876eCe69618e8E8dd743250B036785813824D2D7';
          const accounts = await ethMetaMask.eth.getAccounts();
          if (accounts.length) {
            const balance = await ethMetaMask.eth.getBalance(accounts[0]);
            console.log(balance);

            const anchorContract = new AnchorContract(provider, address);
            const depositAction = await anchorContract.createDeposit();
            // @ts-ignore
            downloadString(depositAction.note.serialize(), depositAction.note.preImageHex.slice(0, 21) + '.text');
            const tx = await anchorContract.deposit(depositAction.deposit.commitment, (event) => {
              console.log({ event });
            });
            const res = await tx.wait();
          }
        }}
      >
        depoist
      </button>
      <div>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
          }}
        />
      </div>
      <button
        onClick={async () => {
          const ethMetaMask = Web3Provider.fromExtension();
          const provider = ethMetaMask.intoEthersProvider();
          const address = '0x876eCe69618e8E8dd743250B036785813824D2D7';
          const accounts = await ethMetaMask.eth.getAccounts();
          if (accounts.length) {
            const balance = await ethMetaMask.eth.getBalance(accounts[0]);
            console.log(balance);

            const anchorContract = new AnchorContract(provider, address);
            await anchorContract.withdraw(note, accounts[0]);
          }
        }}
      >
        withdraw
      </button>
    </div>
  );

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
