// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  AccountsAdapter,
  Bridge,
  Currency,
  NotificationHandler,
  RelayChainMethods,
  WasmFactory,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
  WebbState,
} from '@nepoche/abstract-api-provider';
import { BridgeStorage } from '@nepoche/browser-utils/storage';
import { ApiConfig, getAnchorDeploymentBlockNumber } from '@nepoche/dapp-config';
import { CurrencyRole, WebbError, WebbErrorCodes } from '@nepoche/dapp-types';
import { VAnchorContract } from '@nepoche/evm-contracts';
import { NoteManager } from '@nepoche/note-manager';
import { Storage } from '@nepoche/storage';
import { EventBus } from '@webb-tools/app-util';
import { calculateTypedChainId, ChainType, Keypair, Note, toFixedHex } from '@webb-tools/sdk-core';
import { providers } from 'ethers';
import { Eth } from 'web3-eth';

import { hexToU8a } from '@polkadot/util';

import { Web3BridgeApi } from './webb-provider/bridge-api';
import { Web3ChainQuery } from './webb-provider/chain-query';
import { Web3MixerDeposit } from './webb-provider/mixer-deposit';
import { Web3MixerWithdraw } from './webb-provider/mixer-withdraw';
import { Web3RelayerManager } from './webb-provider/relayer-manager';
import { Web3VAnchorActions } from './webb-provider/vanchor-actions';
import { Web3VAnchorDeposit } from './webb-provider/vanchor-deposit';
import { Web3VAnchorTransfer } from './webb-provider/vanchor-transfer';
import { Web3VAnchorWithdraw } from './webb-provider/vanchor-withdraw';
import { Web3WrapUnwrap } from './webb-provider/wrap-unwrap';
import { Web3Accounts, Web3Provider } from './ext-provider';

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
    readonly noteManager: NoteManager | null,
    readonly config: ApiConfig,
    readonly notificationHandler: NotificationHandler,
    readonly accounts: AccountsAdapter<Eth>,
    readonly wasmFactory: WasmFactory
  ) {
    super();
    this.ethersProvider = web3Provider.intoEthersProvider();
    // There are no relay chain methods for Web3 chains
    this.relayChainMethods = null;
    this.methods = {
      claim: {
        enabled: false,
        core: {} as any,
      },
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
        transfer: {
          enabled: true,
          inner: new Web3VAnchorTransfer(this),
        },
        actions: {
          enabled: true,
          inner: new Web3VAnchorActions(this),
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
        if (bridgeCurrency.getRole() === CurrencyRole.Governable) {
          initialSupportedBridges[bridgeConfig.asset] = new Bridge(bridgeCurrency, bridgeTargets);
        }
      }
    }

    this.state = new WebbState(initialSupportedCurrencies, initialSupportedBridges);

    // Select a reasonable default bridge
    this.state.activeBridge = Object.values(initialSupportedBridges)[0] ?? null;
  }

  getProvider(): Web3Provider {
    return this.web3Provider;
  }

  // Web3 has the evm, so the "api interface" should always be available.
  async ensureApiInterface(): Promise<boolean> {
    return Promise.resolve(true);
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

  async getVAnchorNotesFromChain(contract: VAnchorContract, owner: Keypair, abortSignal: AbortSignal): Promise<Note[]> {
    const evmId = await contract.getEvmId();
    const typedChainId = calculateTypedChainId(ChainType.EVM, evmId);
    const tokenSymbol = await this.methods.bridgeApi.getCurrency()!;
    const utxos = await contract.getSpendableUtxosFromChain(
      owner,
      getAnchorDeploymentBlockNumber(typedChainId, contract.inner.address) || 1,
      0,
      abortSignal
    );

    const notes = Promise.all(
      utxos.map(async (utxo) => {
        console.log(utxo.serialize());
        const secrets = [toFixedHex(utxo.chainId, 8), toFixedHex(utxo.amount), utxo.secret_key, utxo.blinding].join(
          ':'
        );

        const note: Note = await Note.generateNote({
          amount: utxo.amount,
          backend: 'Circom',
          curve: 'Bn254',
          denomination: '18',
          exponentiation: '5',
          hashFunction: 'Poseidon',
          index: utxo.index,
          privateKey: hexToU8a(utxo.secret_key),
          protocol: 'vanchor',
          secrets,
          sourceChain: typedChainId.toString(),
          sourceIdentifyingData: contract.inner.address,
          targetChain: utxo.chainId,
          targetIdentifyingData: contract.inner.address,
          tokenSymbol: tokenSymbol.view.symbol,
          version: 'v1',
          width: '5',
        });

        return note;
      })
    );

    return notes;
  }

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    web3Provider: Web3Provider,
    chainId: number,
    relayerManager: Web3RelayerManager,
    noteManager: NoteManager | null,
    appConfig: ApiConfig,
    notification: NotificationHandler,
    wasmFactory: WasmFactory // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
  ) {
    const accounts = new Web3Accounts(web3Provider.eth);

    return new WebbWeb3Provider(
      web3Provider,
      chainId,
      relayerManager,
      noteManager,
      appConfig,
      notification,
      accounts,
      wasmFactory
    );
  }

  // Init web3 provider with a generic account provider
  static async initWithCustomAccountAdapter(
    web3Provider: Web3Provider,
    chainId: number,
    relayerManager: Web3RelayerManager,
    noteManager: NoteManager | null,
    appConfig: ApiConfig,
    notification: NotificationHandler,
    web3AccountProvider: AccountsAdapter<Eth>,
    wasmFactory: WasmFactory // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
  ) {
    return new WebbWeb3Provider(
      web3Provider,
      chainId,
      relayerManager,
      noteManager,
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

  async sign(message: string): Promise<{
    sig: string;
    account: string;
  }> {
    const acc = this.ethersProvider.getSigner();
    const address = await acc.getAddress();
    if (!acc) {
      throw WebbError.from(WebbErrorCodes.NoAccountAvailable);
    }
    const sig = await this.web3Provider.sign(message, address);
    return {
      sig,
      account: address,
    };
  }
}
