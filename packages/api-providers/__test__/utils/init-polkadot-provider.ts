/* eslint-disable @typescript-eslint/ban-ts-comment */

// eslint-disable-next-line header/header
import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types';

import {
  Account,
  AccountsAdapter,
  evmIdIntoInternalChainId,
  InteractiveFeedback,
  NotificationPayload,
  PolkadotProvider,
  PromiseOrT,
  RelayerConfig,
  substrateIdIntoInternalChainId,
  WebbPolkadot,
  WebbRelayerManagerFactory,
} from '../../';
import { mockAppConfig } from './mock-config';

const relayerConfig: RelayerConfig[] = [
  {
    endpoint: 'http://localhost:9955',
  },
  {
    endpoint: 'https://relayer.nepoche.com',
  },
  {
    endpoint: 'https://relayer.webb.tools',
  },
  {
    endpoint: 'https://webb.pops.one',
  },
  {
    endpoint: 'https://relayer.bldnodes.org',
  },
];

const notificationHandler = (m: NotificationPayload) => {
  console.log(m);

  return Math.random();
};

notificationHandler.remove = (id: string | number) => {
  console.log(id);
};

class PolkadotAccounts extends AccountsAdapter<InjectedExtension, InjectedAccount> {
  private activeAccount: null | Account<InjectedAccount> = null;
  accounts(): PromiseOrT<Account<InjectedExtension | InjectedAccount>[]> {
    return [];
  }

  get activeOrDefault(): Promise<Account<InjectedAccount> | null> | Account<InjectedAccount> | null {
    return this.activeAccount;
  }

  providerName = 'Polka';

  setActiveAccount(account: Account<InjectedAccount>): PromiseOrT<void> {
    this.activeAccount = account;

    return undefined;
  }
}

export async function initPolkadotProvider(): Promise<WebbPolkadot> {
  const relayerFactory = await WebbRelayerManagerFactory.init(
    relayerConfig,
    (name, basedOn) => {
      try {
        return basedOn === 'evm' ? evmIdIntoInternalChainId(name) : substrateIdIntoInternalChainId(Number(name));
      } catch (e) {
        return null;
      }
    },
    mockAppConfig
  );
  const apiPromise = await PolkadotProvider.getApiPromise('Webb DApp', ['ws://127.0.0.1:9944'], {
    // @ts-ignore
    onError(error: InteractiveFeedback): any {
      console.log(error.reason);
      console.log(error);
    },
  });
  const relayerManager = await relayerFactory.getRelayerManager('substrate');
  const provider = await WebbPolkadot.initWithCustomAccountsAdapter(
    'Webb DApp',
    ['ws://127.0.0.1:9944'],
    {
      onError(error: InteractiveFeedback): any {
        console.log(error.reason);
        console.log(error);
      },
    },
    relayerManager,
    mockAppConfig,
    notificationHandler,
    new PolkadotAccounts({} as any),
    apiPromise,
    {} as any,
    () => null
  );

  return provider;
}
