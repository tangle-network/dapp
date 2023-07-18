// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import {
  AccountsAdapter,
  Bridge,
  Currency,
  NewNotesTxResult,
  NotificationHandler,
  RelayChainMethods,
  Transaction,
  TransactionState,
  WasmFactory,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
  WebbState,
  calculateProvingLeavesAndCommitmentIndex,
} from '@webb-tools/abstract-api-provider';
import { VAnchor } from '@webb-tools/anchors';
import { EventBus } from '@webb-tools/app-util';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
  retryPromise,
} from '@webb-tools/browser-utils';
import { BridgeStorage } from '@webb-tools/browser-utils/storage';
import { VAnchor__factory } from '@webb-tools/contracts';
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
import Storage from '@webb-tools/dapp-types/Storage';
import { NoteManager } from '@webb-tools/note-manager';
import {
  ChainType,
  CircomUtxo,
  Keypair,
  Note,
  Utxo,
  UtxoGenInput,
  buildVariableWitnessCalculator,
  calculateTypedChainId,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { ZkComponents, hexToU8a } from '@webb-tools/utils';
import type { Backend } from '@webb-tools/wasm-utils';
import { Signer, ethers, providers } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { Eth } from 'web3-eth';
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
  readonly type = 'web3';

  state: WebbState;

  private readonly _newBlock = new BehaviorSubject<null | number>(null);

  // Map to store the max edges for each vanchor address
  private readonly vAnchorMaxEdges = new Map<string, number>();

  // Map to store the vAnchor levels for each tree id
  private readonly vAnchorLevels = new Map<string, number>();

  private smallFixtures: ZkComponents | null = null;

  private largeFixtures: ZkComponents | null = null;

  private ethersProvider: providers.Web3Provider;

  readonly typedChainidSubject: BehaviorSubject<number>;

  readonly backend: Backend = 'Circom';

  readonly methods: WebbMethods<'web3', WebbApiProvider<WebbWeb3Provider>>;

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
      const network = await this.ethersProvider.getNetwork();
      this.emit('providerUpdate', [network.chainId]);
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

  async getVAnchorLeaves(
    vanchor: VAnchor,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      tx?: Transaction<NewNotesTxResult>;
    }
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  }> {
    const { tx, commitment, targetRoot, treeHeight } = options;
    const evmId = (await vanchor.contract.provider.getNetwork()).chainId;
    const typedChainId = calculateTypedChainId(ChainType.EVM, evmId);

    // First, try to fetch the leaves from the supported relayers
    const relayers = await this.relayerManager.getRelayersByChainAndAddress(
      typedChainId,
      vanchor.contract.address
    );

    const leavesFromRelayers =
      await this.relayerManager.fetchLeavesFromRelayers(
        relayers,
        vanchor,
        storage,
        options
      );

    // If unable to fetch leaves from the relayers, get them from chain
    if (!leavesFromRelayers) {
      tx?.next(TransactionState.FetchingLeaves, {
        start: 0, // Dummy values
        currentRange: [0, 0], // Dummy values
      });

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
        tx?.cancelToken.abortSignal
      );

      // Merge the leaves from chain with the stored leaves
      // and fixed them to 32 bytes
      const leaves = [
        ...storedContractInfo.leaves,
        ...leavesFromChain.newLeaves,
      ].map((leaf) => toFixedHex(leaf));

      console.log(`Got ${leaves.length} leaves from chain`);

      tx?.next(TransactionState.ValidatingLeaves, undefined);
      // Validate the leaves
      const { leafIndex, provingLeaves } =
        await calculateProvingLeavesAndCommitmentIndex(
          treeHeight,
          leaves,
          targetRoot,
          commitment.toString()
        );

      // If the leafIndex is -1, it means the commitment is not in the tree
      // and we should continue to the next relayer
      if (leafIndex === -1) {
        tx?.next(TransactionState.ValidatingLeaves, false);
      } else {
        tx?.next(TransactionState.ValidatingLeaves, true);
      }

      // Cached all the leaves to re-use them later
      await storage.set('lastQueriedBlock', leavesFromChain.lastQueriedBlock);
      await storage.set('leaves', leaves);

      // Return the leaves for proving and the commitment index
      return {
        provingLeaves,
        commitmentIndex: leafIndex,
      };
    }

    return leavesFromRelayers;
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
          ...NoteManager.defaultNoteGenInput,
          amount: utxo.amount,
          backend: this.backend,
          index: utxo.index,
          privateKey: hexToU8a(utxo.secret_key),
          secrets,
          sourceChain: typedChainId.toString(),
          sourceIdentifyingData: vanchor.contract.address,
          targetChain: utxo.chainId,
          targetIdentifyingData: vanchor.contract.address,
          tokenSymbol: tokenSymbol.view.symbol,
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

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
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

      const smallKey = await fetchVAnchorKeyFromAws(maxEdges, isSmall);

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

    const largeKey = await fetchVAnchorKeyFromAws(maxEdges, isSmall);

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
    provider?: providers.Web3Provider | ApiPromise
  ): Promise<number> {
    if (provider instanceof ApiPromise) {
      throw WebbError.from(WebbErrorCodes.UnsupportedProvider);
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

  async getVAnchorLevels(
    vAnchorAddressOrTreeId: string,
    provider?: ApiPromise | ethers.providers.Web3Provider
  ): Promise<number> {
    if (provider instanceof ApiPromise) {
      throw WebbError.from(WebbErrorCodes.UnsupportedProvider);
    }

    const storedLevels = this.vAnchorLevels.get(vAnchorAddressOrTreeId);
    if (storedLevels) {
      return Promise.resolve(storedLevels);
    }

    const vAnchorContract = VAnchor__factory.connect(
      vAnchorAddressOrTreeId,
      provider ?? this.ethersProvider
    );
    const levels = await retryPromise(vAnchorContract.getLevels);

    this.vAnchorLevels.set(vAnchorAddressOrTreeId, levels);
    return levels;
  }

  generateUtxo(input: UtxoGenInput): Promise<Utxo> {
    return CircomUtxo.generateUtxo(input);
  }
}
