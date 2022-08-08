// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { EventBus } from '@webb-tools/app-util';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { providers } from 'ethers';
import { Eth } from 'web3-eth';

import { Currency, RelayChainMethods, WasmFactory } from '../abstracts';
import { Bridge, WebbState } from '../abstracts/state';
import { AccountsAdapter } from '../account/Accounts.adapter';
import { VAnchorContract } from '../contracts/wrappers/webb-vanchor';
import { Web3Accounts, Web3Provider } from '../ext-providers';
import {
  AppConfig,
  BridgeStorage,
  getAnchorDeploymentBlockNumber,
  NotificationHandler,
  Storage,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '../';
import { Web3BridgeApi } from './bridge-api';
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
  state: WebbState;
  readonly methods: WebbMethods<WebbWeb3Provider>;
  readonly relayChainMethods: RelayChainMethods<WebbApiProvider<WebbWeb3Provider>> | null;
  private ethersProvider: providers.Web3Provider;

  private constructor(
    private web3Provider: Web3Provider,
    protected chainId: number,
    readonly relayerManager: Web3RelayerManager,
    readonly config: AppConfig,
    readonly notificationHandler: NotificationHandler,
    readonly accounts: AccountsAdapter<Eth>,
    readonly wasmFactory: WasmFactory
  ) {
    super();
    this.ethersProvider = web3Provider.intoEthersProvider();
    // There are no relay chain methods for Web3 chains
    this.relayChainMethods = null;
    this.methods = {
      bridgeApi: new Web3BridgeApi(this),
      chainQuery: new Web3ChainQuery(this),
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

    // Take the configured values in the config and create objects used in the
    // api (e.g. Record<number, CurrencyConfig> => Currency[])
    let initialSupportedCurrencies: Record<number, Currency> = {};
    for (let currencyConfig of Object.values(config.currencies)) {
      initialSupportedCurrencies[currencyConfig.id] = new Currency(currencyConfig);
    }

    // All supported bridges are supplied by the config, before passing to the state.
    let initialSupportedBridges: Record<number, Bridge> = {};
    for (let bridgeConfig of Object.values(config.bridgeByAsset)) {
      if (Object.keys(bridgeConfig.anchors).includes(calculateTypedChainId(ChainType.EVM, chainId).toString())) {
        const bridgeCurrency = initialSupportedCurrencies[bridgeConfig.asset];
        const bridgeTargets = bridgeConfig.anchors;
        initialSupportedBridges[bridgeConfig.asset] = new Bridge(bridgeCurrency, bridgeTargets);
      }
    }

    this.state = new WebbState(initialSupportedCurrencies, initialSupportedBridges);

    // Select a reasonable default bridge
    this.state.activeBridge = Object.values(initialSupportedBridges)[0] ?? null;
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

  async setAccountListener() {
    const handler = async () => {
      this.emit('newAccounts', this.accounts);
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.ethersProvider.provider?.on?.('accountsChanged', handler);
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

  // VAnchors require zero knowledge proofs on deposit - Fetch the small and large circuits.
  getVariableAnchorByAddress(address: string): VAnchorContract {
    return new VAnchorContract(this.ethersProvider, address);
  }

  getVariableAnchorByAddressAndProvider(address: string, provider: providers.Web3Provider): VAnchorContract {
    return new VAnchorContract(provider, address, true);
  }

  getEthersProvider(): providers.Web3Provider {
    return this.ethersProvider;
  }

  async getVariableAnchorLeaves(
    contract: VAnchorContract,
    storage: Storage<BridgeStorage>,
    abortSignal: AbortSignal
  ): Promise<string[]> {
    const evmId = await contract.getEvmId();
    const typedChainId = calculateTypedChainId(ChainType.EVM, evmId);
    // First, try to fetch the leaves from the supported relayers
    const relayers = await this.relayerManager.getRelayersByChainAndAddress(typedChainId, contract.inner.address);
    let leaves = await this.relayerManager.fetchLeavesFromRelayers(relayers, contract, storage, abortSignal);

    // If unable to fetch leaves from the relayers, get them from chain
    if (!leaves) {
      // check if we already cached some values.
      const storedContractInfo: BridgeStorage[0] = (await storage.get(contract.inner.address.toLowerCase())) || {
        lastQueriedBlock: getAnchorDeploymentBlockNumber(typedChainId, contract.inner.address) || 0,
        leaves: [] as string[],
      };

      const leavesFromChain = await contract.getDepositLeaves(storedContractInfo.lastQueriedBlock + 1, 0, abortSignal);

      leaves = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves];
    }

    return leaves;
  }

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    web3Provider: Web3Provider,
    chainId: number,
    relayerManager: Web3RelayerManager,
    appConfig: AppConfig,
    notification: NotificationHandler,
    wasmFactory: WasmFactory // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
  ) {
    const accounts = new Web3Accounts(web3Provider.eth);

    return new WebbWeb3Provider(web3Provider, chainId, relayerManager, appConfig, notification, accounts, wasmFactory);
  }

  // Init web3 provider with a generic account provider
  static async initWithCustomAccountAdapter(
    web3Provider: Web3Provider,
    chainId: number,
    relayerManager: Web3RelayerManager,
    appConfig: AppConfig,
    notification: NotificationHandler,
    web3AccountProvider: AccountsAdapter<Eth>,
    wasmFactory: WasmFactory // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
  ) {
    return new WebbWeb3Provider(
      web3Provider,
      chainId,
      relayerManager,
      appConfig,
      notification,
      web3AccountProvider,
      wasmFactory
    );
  }

  get capabilities() {
    return this.web3Provider.capabilities;
  }

  endSession(): Promise<void> {
    this.unsubscribeAll();
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
        const chainId = calculateTypedChainId(ChainType.EVM, evmChainId);
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
}
