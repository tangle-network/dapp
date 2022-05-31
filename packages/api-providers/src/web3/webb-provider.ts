// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import { providers } from 'ethers';
import { Eth } from 'web3-eth';

import { AccountsAdapter } from '../account/Accounts.adapter';
import { evmIdIntoInternalChainId } from '../chains';
import { AnchorContract } from '../contracts/wrappers';
import { VAnchorContract } from '../contracts/wrappers/webb-vanchor';
import { Web3Accounts, Web3Provider } from '../ext-providers';
import {
  AppConfig,
  NotificationHandler,
  Web3AnchorDeposit,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '../';
import { Web3AnchorApi } from './anchor-api';
import { Web3AnchorWithdraw } from './anchor-withdraw';
import { Web3ChainQuery } from './chain-query';
import { Web3MixerDeposit } from './mixer-deposit';
import { Web3MixerWithdraw } from './mixer-withdraw';
import { Web3RelayerManager } from './relayer-manager';
import { Web3VAnchorDeposit } from './vanchor-deposit';
import { Web3VAnchorWithdraw } from './vanchor-withdraw';
import { Web3WrapUnwrap } from './wrap-unwrap';

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider<WebbWeb3Provider>
{
  readonly methods: WebbMethods<WebbWeb3Provider>;
  private ethersProvider: providers.Web3Provider;
  // TODO: make the factory configurable if the web3 interface in need of this functionality
  readonly wasmFactory = () => {
    return null;
  };

  private constructor(
    private web3Provider: Web3Provider,
    protected chainId: number,
    readonly relayerManager: Web3RelayerManager,
    readonly config: AppConfig,
    readonly notificationHandler: NotificationHandler,
    readonly accounts: AccountsAdapter<Eth>
  ) {
    super();
    this.ethersProvider = web3Provider.intoEthersProvider();

    this.methods = {
      anchorApi: new Web3AnchorApi(this, this.config.bridgeByAsset),
      chainQuery: new Web3ChainQuery(this),
      fixedAnchor: {
        deposit: {
          enabled: true,
          inner: new Web3AnchorDeposit(this),
        },
        withdraw: {
          enabled: true,
          inner: new Web3AnchorWithdraw(this),
        },
      },
      mixer: {
        deposit: {
          enabled: true,
          inner: new Web3MixerDeposit(this),
        },
        withdraw: {
          enabled: true,
          inner: new Web3MixerWithdraw(this),
        },
      },
      variableAnchor: {
        deposit: {
          enabled: true,
          inner: new Web3VAnchorDeposit(this),
        },
        withdraw: {
          enabled: true,
          inner: new Web3VAnchorWithdraw(this),
        },
      },
      wrapUnwrap: {
        core: {
          enabled: true,
          inner: new Web3WrapUnwrap(this),
        },
      },
    };
  }

  getProvider(): Web3Provider {
    return this.web3Provider;
  }

  async setChainListener() {
    this.ethersProvider = this.web3Provider.intoEthersProvider();

    const handler = async () => {
      const chainId = await this.web3Provider.network;

      this.emit('providerUpdate', [chainId]);
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.ethersProvider.provider?.on?.('chainChanged', handler);
  }

  async destroy(): Promise<void> {
    await this.endSession();
    this.subscriptions = {
      interactiveFeedback: [],
      providerUpdate: [],
    };
  }

  async getChainId(): Promise<number> {
    const chainId = (await this.ethersProvider.getNetwork()).chainId;

    return chainId;
  }

  async getBlockNumber(): Promise<number> {
    const blockNumber = await this.ethersProvider.getBlockNumber();

    return blockNumber;
  }

  getFixedAnchorByAddress(address: string): AnchorContract {
    return new AnchorContract(this.ethersProvider, address);
  }

  // VAnchors require zero knowledge proofs on deposit - Fetch the small and large circuits.
  getVariableAnchorByAddress(address: string): VAnchorContract {
    return new VAnchorContract(this.ethersProvider, address);
  }

  getFixedAnchorByAddressAndProvider(address: string, provider: providers.Web3Provider): AnchorContract {
    return new AnchorContract(provider, address, true);
  }

  getEthersProvider(): providers.Web3Provider {
    return this.ethersProvider;
  }

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    web3Provider: Web3Provider,
    chainId: number,
    relayerManager: Web3RelayerManager,
    appConfig: AppConfig,
    notification: NotificationHandler
  ) {
    const accounts = new Web3Accounts(web3Provider.eth);

    return new WebbWeb3Provider(web3Provider, chainId, relayerManager, appConfig, notification, accounts);
  }

  // Init web3 provider with a generic account provider
  static async initWithCustomAccountAdapter(
    web3Provider: Web3Provider,
    chainId: number,
    relayerManager: Web3RelayerManager,
    appConfig: AppConfig,
    notification: NotificationHandler,
    web3AccountProvider: AccountsAdapter<Eth>
  ) {
    return new WebbWeb3Provider(web3Provider, chainId, relayerManager, appConfig, notification, web3AccountProvider);
  }

  get capabilities() {
    return this.web3Provider.capabilities;
  }

  endSession(): Promise<void> {
    return this.web3Provider.endSession();
  }

  switchOrAddChain(evmChainId: number) {
    return this.web3Provider
      .switchChain({
        chainId: `0x${evmChainId.toString(16)}`,
      })
      ?.catch(async (switchError) => {
        console.log('inside catch for switchChain', switchError);

        // cannot switch because network not recognized, so fetch configuration
        const chainId = evmIdIntoInternalChainId(evmChainId);
        const chain = this.config.chains[chainId];

        // prompt to add the chain
        if (switchError.code === 4902) {
          const currency = this.config.currencies[chain.nativeCurrencyId];

          await this.web3Provider.addChain({
            chainId: `0x${evmChainId.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: {
              decimals: 18,
              name: currency.name,
              symbol: currency.symbol,
            },
            rpcUrls: chain.evmRpcUrls!,
          });
          // add network will prompt the switch, check evmId again and throw if user rejected
          const newChainId = await this.web3Provider.network;

          if (newChainId !== chain.chainId) {
            throw switchError;
          }
        } else {
          throw switchError;
        }
      });
  }

  public get innerProvider() {
    return this.web3Provider;
  }
}
