// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  WebbApiProvider,
  WebbProviderEvents,
} from '@webb-tools/abstract-api-provider';
import { ApiConfig } from '@webb-tools/dapp-config';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { EventBus } from '@webb-tools/dapp-types/EventBus';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/dapp-types/TypedChainId';
import assert from 'assert';
import values from 'lodash/values';
import { BehaviorSubject } from 'rxjs';
import {
  type Account,
  type Chain,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import type { Connector } from 'wagmi';
import {
  disconnect,
  getPublicClient,
  getWalletClient,
  signMessage,
  watchAccount,
  watchBlockNumber,
  watchChainId,
} from 'wagmi/actions';
import { Web3Accounts } from './ext-provider';

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider
{
  private readonly _newBlock = new BehaviorSubject<null | bigint>(null);

  private unsubscribeFns: Set<() => void>;

  readonly typedChainidSubject: BehaviorSubject<number>;

  /**
   * The current public client instance of the connected chain.
   */
  readonly publicClient: PublicClient<Transport, Chain>;

  get newBlock() {
    return this._newBlock.asObservable();
  }

  private constructor(
    readonly connector: Connector,
    readonly walletClient: WalletClient<Transport, Chain, Account>,
    protected chainId: number,
    readonly config: ApiConfig,
    readonly accounts: Web3Accounts,
  ) {
    super();

    const typedChainId = calculateTypedChainId(ChainType.EVM, chainId);
    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    const wagmiConfig = getWagmiConfig();
    const client = getPublicClient(wagmiConfig, { chainId });

    assert(client, WebbError.from(WebbErrorCodes.NoClientAvailable).message);

    // TODO: Fix type casting here
    this.publicClient = client as PublicClient<Transport, Chain>;

    this.unsubscribeFns = new Set();

    const unsub = watchBlockNumber(wagmiConfig, {
      chainId,
      emitOnBegin: true,
      onBlockNumber: (blockNumber) => {
        this._newBlock.next(blockNumber);
      },
    });

    this.unsubscribeFns.add(unsub);
  }

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    connector: Connector,
    chainId: number,
    appConfig: ApiConfig,
  ) {
    const accounts = new Web3Accounts(connector);

    const walletClient = await getWalletClient(getWagmiConfig(), {
      connector,
      chainId,
      account: accounts.activeOrDefault?.address,
    });

    return new WebbWeb3Provider(
      connector,
      walletClient,
      chainId,
      appConfig,
      accounts,
    );
  }

  getProvider() {
    return this.walletClient;
  }

  getBlockNumber(): bigint | null {
    return this._newBlock.getValue();
  }

  setChainListener() {
    const unsub = watchChainId(getWagmiConfig(), {
      onChange: (chainId) => {
        this.emit('providerUpdate', [chainId]);
      },
    });

    this.unsubscribeFns.add(unsub);

    return unsub;
  }

  setAccountListener() {
    const unsub = watchAccount(getWagmiConfig(), {
      onChange: (account) => {
        // Only emit the new accounts if the account is not disconnected
        if (account.status !== 'disconnected') {
          this.emit('newAccounts', this.accounts);
        }
      },
    });

    this.unsubscribeFns.add(unsub);

    return unsub;
  }

  async destroy() {
    await this.endSession();
    this.subscriptions = {
      providerUpdate: [],
    };
  }

  async getChainId() {
    return this.connector.getChainId();
  }

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
  }

  async endSession(): Promise<void> {
    await disconnect(getWagmiConfig(), {
      connector: this.connector,
    });
    this.unsubscribeFns.forEach((unsub) => unsub());
    return this.unsubscribeAll();
  }

  async switchOrAddChain(evmChainId: number) {
    if (typeof this.connector.switchChain !== 'function') {
      throw WebbError.from(WebbErrorCodes.NoSwitchChainMethod);
    }

    const typedChainId = calculateTypedChainId(ChainType.EVM, evmChainId);
    const chain = this.config.chains[typedChainId];
    if (chain === undefined) {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }

    const blockExplorerUrls = values(chain.blockExplorers).map((c) => c.url);
    const rpcUrls = values(chain.rpcUrls)
      .map((c) => c.http)
      .flat();

    return this.connector.switchChain({
      chainId: evmChainId,
      addEthereumChainParameter: {
        chainName: chain.name,
        nativeCurrency: chain.nativeCurrency,
        blockExplorerUrls,
        rpcUrls,
      },
    });
  }

  async sign(message: string): Promise<string> {
    const account = this.accounts.activeOrDefault;
    if (!account) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }

    return signMessage(getWagmiConfig(), {
      account: account.address,
      connector: this.connector,
      message,
    });
  }
}
