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
} from '@webb-tools/abstract-api-provider';
import { EventBus } from '@webb-tools/app-util';
import { BridgeStorage } from '@webb-tools/browser-utils/storage';
import {
  ApiConfig,
  getAnchorDeploymentBlockNumber,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import {
  CurrencyRole,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import {
  buildVariableWitnessCalculator,
  calculateTypedChainId,
  ChainType,
  Keypair,
  Note,
  toFixedHex,
  Utxo,
} from '@webb-tools/sdk-core';
import { Storage } from '@webb-tools/storage';
import { ethers, providers, Signer } from 'ethers';
import { Eth } from 'web3-eth';

import { hexToU8a } from '@polkadot/util';

import { ApiPromise } from '@polkadot/api';
import { VAnchor } from '@webb-tools/anchors';
import { retryPromise } from '@webb-tools/browser-utils';
import { VAnchor__factory } from '@webb-tools/contracts';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
} from '@webb-tools/fixtures-deployments';
import { ZkComponents } from '@webb-tools/utils';
import { BehaviorSubject } from 'rxjs';
import { Web3Accounts, Web3Provider } from './ext-provider';
import { Web3BridgeApi } from './webb-provider/bridge-api';
import { Web3ChainQuery } from './webb-provider/chain-query';
import { Web3RelayerManager } from './webb-provider/relayer-manager';
import { Web3VAnchorActions } from './webb-provider/vanchor-actions';
import { Web3WrapUnwrap } from './webb-provider/wrap-unwrap';

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider<WebbWeb3Provider>
{
  type(): string {
    return 'Web3';
  }

  state: WebbState;

  private readonly _newBlock = new BehaviorSubject<null | number>(null);

  readonly typedChainidSubject: BehaviorSubject<number>;

  // Map to store the max edges for each vanchor address
  private readonly vAnchorMaxEdges = new Map<string, number>();

  private smallFixtures: ZkComponents | null = null;

  private largeFixtures: ZkComponents | null = null;

  private ethersProvider: providers.Web3Provider;

  readonly methods: WebbMethods<WebbWeb3Provider>;

  readonly relayChainMethods: RelayChainMethods<
    WebbApiProvider<WebbWeb3Provider>
  > | null;

  get newBlock() {
    return this._newBlock.asObservable();
  }

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

    const typedChainId = calculateTypedChainId(ChainType.EVM, chainId);
    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    this.ethersProvider = web3Provider.intoEthersProvider();
    this.ethersProvider.on('block', () => {
      this.ethersProvider.getBlockNumber().then((b) => {
        this._newBlock.next(b);
      });
    });
    // There are no relay chain methods for Web3 chains
    this.relayChainMethods = null;
    this.methods = {
      claim: {
        enabled: false,
        core: {} as any,
      },
      bridgeApi: new Web3BridgeApi(this),
      chainQuery: new Web3ChainQuery(this),
      variableAnchor: {
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
    const initialSupportedCurrencies: Record<number, Currency> = {};
    for (const currencyConfig of Object.values(config.currencies)) {
      initialSupportedCurrencies[currencyConfig.id] = new Currency(
        currencyConfig
      );
    }

    // All supported bridges are supplied by the config, before passing to the state.
    const initialSupportedBridges: Record<number, Bridge> = {};

    for (const bridgeConfig of Object.values(config.bridgeByAsset)) {
      if (
        Object.keys(bridgeConfig.anchors).includes(
          calculateTypedChainId(ChainType.EVM, chainId).toString()
        )
      ) {
        const bridgeCurrency = initialSupportedCurrencies[bridgeConfig.asset];
        const bridgeTargets = bridgeConfig.anchors;
        if (bridgeCurrency.getRole() === CurrencyRole.Governable) {
          initialSupportedBridges[bridgeConfig.asset] = new Bridge(
            bridgeCurrency,
            bridgeTargets
          );
        }
      }
    }

    this.state = new WebbState(
      initialSupportedCurrencies,
      initialSupportedBridges
    );

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
  getVariableAnchorByAddress(address: string): Promise<VAnchor> {
    return this.getVariableAnchorByAddressAndProvider(
      address,
      this.ethersProvider,
      this.ethersProvider.getSigner()
    );
  }

  async getVariableAnchorByAddressAndProvider(
    address: string,
    provider: providers.Web3Provider,
    signer?: Signer
  ): Promise<VAnchor> {
    const maxEdges = await this.getVAnchorMaxEdges(address, provider);

    const currentActiveSigner = this.ethersProvider.getSigner();

    let signerOrDummySigner: Signer;
    if (signer) {
      signerOrDummySigner = signer;
    } else {
      signerOrDummySigner = new ethers.VoidSigner(
        await currentActiveSigner.getAddress(),
        provider
      );
    }

    return VAnchor.connect(
      address,
      await this.getZkFixtures(maxEdges, true),
      await this.getZkFixtures(maxEdges, false),
      signerOrDummySigner
    );
  }

  getEthersProvider(): providers.Web3Provider {
    return this.ethersProvider;
  }

  async getVariableAnchorLeaves(
    vanchor: VAnchor,
    storage: Storage<BridgeStorage>,
    abortSignal?: AbortSignal
  ): Promise<string[]> {
    const evmId = (await vanchor.contract.provider.getNetwork()).chainId;
    const typedChainId = calculateTypedChainId(ChainType.EVM, evmId);

    // First, try to fetch the leaves from the supported relayers
    const relayers = await this.relayerManager.getRelayersByChainAndAddress(
      typedChainId,
      vanchor.contract.address
    );

    let leaves = await this.relayerManager.fetchLeavesFromRelayers(
      relayers,
      vanchor,
      storage,
      abortSignal
    );

    // If unable to fetch leaves from the relayers, get them from chain
    if (!leaves) {
      // check if we already cached some values.
      const lastQueriedBlock = await storage.get('lastQueriedBlock');
      const storedLeaves = await storage.get('leaves');

      const storedContractInfo: BridgeStorage = {
        lastQueriedBlock:
          (lastQueriedBlock ||
            getAnchorDeploymentBlockNumber(
              typedChainId,
              vanchor.contract.address
            )) ??
          0,
        leaves: storedLeaves || [],
      };

      console.log('Stored contract info: ', storedContractInfo);

      const leavesFromChain = await vanchor.getDepositLeaves(
        storedContractInfo.lastQueriedBlock + 1,
        0,
        retryPromise,
        abortSignal
      );

      console.log('Leaves from chain: ', leavesFromChain);

      leaves = [...storedContractInfo.leaves, ...leavesFromChain.newLeaves];

      // Fixed all the leaves to be 32 bytes
      leaves = leaves.map((leaf) => toFixedHex(leaf));

      // Cached the new leaves
      await storage.set('lastQueriedBlock', leavesFromChain.lastQueriedBlock);
      await storage.set('leaves', leaves);
    } else {
      console.log(`Got ${leaves.length} leaves from relayers.`);
    }

    return leaves;
  }

  async getVAnchorNotesFromChain(
    vanchor: VAnchor,
    owner: Keypair,
    abortSignal: AbortSignal
  ): Promise<Note[]> {
    const evmId = (await vanchor.contract.provider.getNetwork()).chainId;
    const typedChainId = calculateTypedChainId(ChainType.EVM, evmId);
    const tokenSymbol = this.methods.bridgeApi.getCurrency();
    if (!tokenSymbol) {
      throw new Error('Currency not found'); // Development error
    }

    const utxosFromChain = await vanchor.getSpendableUtxosFromChain(
      owner,
      getAnchorDeploymentBlockNumber(typedChainId, vanchor.contract.address) ||
        1,
      0,
      retryPromise,
      abortSignal
    );

    // Check if the UTXOs are already spent on chain
    const utxos = (
      await Promise.all(
        utxosFromChain.map(async (utxo) => {
          const typedChainId = Number(utxo.chainId);
          const chain = this.config.chains[typedChainId];
          if (!chain) {
            throw new Error('Chain not found'); // Development error
          }

          const provider = Web3Provider.fromUri(chain.url);
          const vAnchorContract = VAnchor__factory.connect(
            vanchor.contract.address,
            provider.intoEthersProvider()
          );
          const alreadySpent = await retryPromise(() =>
            vAnchorContract.isSpent(toFixedHex(`0x${utxo.nullifier}`, 32))
          );

          return alreadySpent ? null : utxo;
        })
      )
    ).filter((utxo): utxo is Utxo => !!utxo && utxo.amount !== '0');

    console.log(`Found ${utxos.length} UTXOs on chain`);

    const notes = Promise.all(
      utxos.map(async (utxo) => {
        if (utxo.amount !== '0') {
          console.log(utxo.serialize());
        }
        const secrets = [
          toFixedHex(utxo.chainId, 8),
          toFixedHex(utxo.amount),
          utxo.secret_key,
          utxo.blinding,
        ].join(':');

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
          sourceIdentifyingData: vanchor.contract.address,
          targetChain: utxo.chainId,
          targetIdentifyingData: vanchor.contract.address,
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
    const typedChainId = calculateTypedChainId(ChainType.EVM, evmChainId);
    const chain = this.config.chains[typedChainId];

    const currency = getNativeCurrencyFromConfig(
      this.config.currencies,
      typedChainId
    );
    if (!chain || !currency) {
      throw new Error('Chain or currency not found'); // Development error
    }

    return this.web3Provider.addChain({
      chainId: `0x${evmChainId.toString(16)}`,
      chainName: chain.name,
      nativeCurrency: {
        decimals: 18,
        name: currency.name,
        symbol: currency.symbol,
      },
      rpcUrls: chain.evmRpcUrls ?? [],
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

  async getZkFixtures(
    maxEdges: number,
    isSmall = false
  ): Promise<ZkComponents> {
    const dummyAbortSignal = new AbortController().signal;

    if (isSmall) {
      if (this.smallFixtures) {
        return this.smallFixtures;
      }

      const smallKey = await fetchVAnchorKeyFromAws(
        maxEdges,
        isSmall,
        dummyAbortSignal
      );

      const smallWasm = await fetchVAnchorWasmFromAws(
        maxEdges,
        isSmall,
        dummyAbortSignal
      );

      const smallFixtures = {
        zkey: smallKey,
        wasm: Buffer.from(smallWasm),
        witnessCalculator: buildVariableWitnessCalculator,
      };

      this.smallFixtures = smallFixtures;
      return smallFixtures;
    }

    if (this.largeFixtures) {
      return this.largeFixtures;
    }

    const largeKey = await fetchVAnchorKeyFromAws(
      maxEdges,
      isSmall,
      dummyAbortSignal
    );

    const largeWasm = await fetchVAnchorWasmFromAws(
      maxEdges,
      isSmall,
      dummyAbortSignal
    );

    const largeFixtures = {
      zkey: largeKey,
      wasm: Buffer.from(largeWasm),
      witnessCalculator: buildVariableWitnessCalculator,
    };

    this.largeFixtures = largeFixtures;
    return largeFixtures;
  }

  async getVAnchorMaxEdges(
    vAnchorAddress: string,
    provider?: providers.Provider | ApiPromise
  ): Promise<number> {
    if (provider instanceof ApiPromise) {
      console.error(
        '`provider` of the type `ApiPromise` is not supported in web3 provider overriding to `this.ethersProvider`'
      );
      provider = this.ethersProvider;
    }

    const storedMaxEdges = this.vAnchorMaxEdges.get(vAnchorAddress);
    if (storedMaxEdges) {
      return Promise.resolve(storedMaxEdges);
    }

    const vAnchorContract = VAnchor__factory.connect(
      vAnchorAddress,
      provider ?? this.ethersProvider
    );
    const maxEdges = await retryPromise(vAnchorContract.maxEdges);

    this.vAnchorMaxEdges.set(vAnchorAddress, maxEdges);
    return maxEdges;
  }
}
