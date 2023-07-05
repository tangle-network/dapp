// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import '@webb-tools/api-derive';
import '@webb-tools/protocol-substrate-types';

import {
  ApiInitHandler,
  Currency,
  NewNotesTxResult,
  NotificationHandler,
  ProvideCapabilities,
  RelayChainMethods,
  Transaction,
  TransactionState,
  WasmFactory,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
  calculateProvingLeavesAndCommitmentIndex,
} from '@webb-tools/abstract-api-provider';
import { AccountsAdapter } from '@webb-tools/abstract-api-provider/account/Accounts.adapter';
import { Bridge, WebbState } from '@webb-tools/abstract-api-provider/state';
import { EventBus } from '@webb-tools/app-util';
import { ApiConfig, Wallet } from '@webb-tools/dapp-config';
import {
  ActionsBuilder,
  CurrencyRole,
  InteractiveFeedback,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import {
  ChainType,
  CircomUtxo,
  Utxo,
  UtxoGenInput,
  buildVariableWitnessCalculator,
  calculateTypedChainId,
  parseTypedChainId,
  toFixedHex,
} from '@webb-tools/sdk-core';

import { ApiPromise } from '@polkadot/api';
import {
  InjectedAccount,
  InjectedExtension,
} from '@polkadot/extension-inject/types';

import { VoidFn } from '@polkadot/api/types';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
} from '@webb-tools/fixtures-deployments';
import { ZERO_BYTES32, ZkComponents, u8aToHex } from '@webb-tools/utils';
import type { Backend } from '@webb-tools/wasm-utils';
import { BehaviorSubject, Observable } from 'rxjs';

import { PublicClient } from 'viem';
import { PolkadotProvider } from './ext-provider';
import { PolkaTXBuilder } from './transaction';
import { PolkadotBridgeApi } from './webb-provider/bridge-api';
import { PolkadotChainQuery } from './webb-provider/chain-query';
import { PolkadotCrowdloan } from './webb-provider/crowdloan';
import { PolkadotECDSAClaims } from './webb-provider/ecdsa-claims';
import { PolkadotRelayerManager } from './webb-provider/relayer-manager';
import { PolkadotVAnchorActions } from './webb-provider/vanchor-actions';
import { PolkadotWrapUnwrap } from './webb-provider/wrap-unwrap';
import { getLeaves } from './mt-utils';
import { Storage } from '@webb-tools/storage';
import { BridgeStorage } from '@webb-tools/browser-utils';
import { providers } from 'ethers';
import { VAnchor } from '@webb-tools/anchors';

export class WebbPolkadot
  extends EventBus<WebbProviderEvents>
  implements WebbApiProvider<WebbPolkadot>
{
  readonly type = 'polkadot';

  state: WebbState;
  noteManager: NoteManager | null = null;

  readonly methods: WebbMethods<'polkadot', WebbApiProvider<WebbPolkadot>>;

  readonly relayChainMethods: RelayChainMethods<WebbApiProvider<WebbPolkadot>>;

  readonly api: ApiPromise;
  readonly txBuilder: PolkaTXBuilder;

  readonly newBlockSub = new Set<VoidFn>();

  readonly typedChainidSubject: BehaviorSubject<number>;

  readonly backend: Backend = 'Circom';

  private _newBlock = new BehaviorSubject<null | number>(null);

  // Map to store the max edges for each tree id
  private readonly vAnchorMaxEdges = new Map<string, number>();

  // Map to store the vAnchor levels for each tree id
  private readonly vAnchorLevels = new Map<string, number>();

  private smallFixtures: ZkComponents | null = null;

  private largeFixtures: ZkComponents | null = null;

  private constructor(
    apiPromise: ApiPromise,
    typedChainId: number,
    injectedExtension: InjectedExtension,
    readonly relayerManager: PolkadotRelayerManager,
    public readonly config: ApiConfig,
    readonly notificationHandler: NotificationHandler,
    private readonly provider: PolkadotProvider,
    readonly accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
    readonly wasmFactory: WasmFactory
  ) {
    super();

    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    this.provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notificationHandler, injectedExtension)
    );

    this.accounts = this.provider.accounts;
    this.api = this.provider.api;
    this.txBuilder = this.provider.txBuilder;

    this.relayChainMethods = {
      crowdloan: {
        enabled: true,
        inner: new PolkadotCrowdloan(this),
      },
    };

    this.methods = {
      bridgeApi: new PolkadotBridgeApi(this),
      chainQuery: new PolkadotChainQuery(this),
      claim: {
        core: new PolkadotECDSAClaims(this),
        enabled: true,
      },
      variableAnchor: {
        actions: {
          enabled: true,
          inner: new PolkadotVAnchorActions(this),
        },
      },
      wrapUnwrap: {
        core: {
          enabled: true,
          inner: new PolkadotWrapUnwrap(this),
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
      if (Object.keys(bridgeConfig.anchors).includes(typedChainId.toString())) {
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

    // set the available bridges of the new chain
    this.state.setBridgeOptions(initialSupportedBridges);

    // Select a reasonable default bridge
    this.state.activeBridge = Object.values(initialSupportedBridges)[0] ?? null;
  }

  capabilities?: ProvideCapabilities | undefined;

  getProvider() {
    return this.provider;
  }

  async getChainId(): Promise<number> {
    const chainIdentifier =
      this.provider.api.consts.linkableTreeBn254.chainIdentifier;
    if (!chainIdentifier.isEmpty) {
      return chainIdentifier.toNumber();
    }

    // If the chainId is not set, fallback to the typedChainId
    return parseTypedChainId(this.typedChainId).chainId;
  }

  async awaitMetaDataCheck() {
    /// delay some time till the UI is instantiated and then check if the dApp needs to update extension meta data
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const metaData = await this.provider.checkMetaDataUpdate();

    if (metaData) {
      /// feedback body
      const feedbackEntries = InteractiveFeedback.feedbackEntries([
        {
          header: 'Update Polkadot MetaData',
        },
      ]);
      /// feedback actions
      const actions = ActionsBuilder.init()
        /// update extension metadata
        .action(
          'Update MetaData',
          () => this.provider.updateMetaData(metaData),
          'success'
        )
        .actions();
      const feedback = new InteractiveFeedback(
        'info',
        actions,
        () => {
          return null;
        },
        feedbackEntries
      );

      /// emit the feedback object
      this.emit('interactiveFeedback', feedback);
    }
  }

  async ensureApiInterface() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const merkleRPC = Boolean(this.api.rpc.mt.getLeaves);
    // merkle rpc
    const merklePallet = this.api.query.merkleTreeBn254;
    const vAnchorPallet = this.api.query.vAnchorBn254;
    if (!merklePallet || !merkleRPC || !vAnchorPallet) {
      throw WebbError.from(WebbErrorCodes.InsufficientProviderInterface);
    }

    return true;
  }

  static async init(
    appName: string, // App name, arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    relayerBuilder: PolkadotRelayerManager, // Webb Relayer builder for relaying withdraw
    apiConfig: ApiConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    wasmFactory: WasmFactory, // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
    typedChainId: number,
    wallet: Wallet // Current wallet to initialize
  ): Promise<WebbPolkadot> {
    const [apiPromise, injectedExtension] = await PolkadotProvider.getParams(
      appName,
      endpoints,
      errorHandler.onError,
      wallet
    );
    const provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notification, injectedExtension)
    );
    const accounts = provider.accounts;
    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      relayerBuilder,
      apiConfig,
      notification,
      provider,
      accounts,
      wasmFactory
    );
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;

    // await instance.ensureApiInterface();
    const unsub = await instance.listenerBlocks();
    instance.newBlockSub.add(unsub);

    return instance;
  }

  static async initWithCustomAccountsAdapter(
    appName: string, // App name Arbitrary name
    endpoints: string[], // Endpoints of the substrate node
    errorHandler: ApiInitHandler, // Error handler that will be used to catch errors while initializing the provider
    relayerBuilder: PolkadotRelayerManager, // Webb Relayer builder for relaying withdraw
    ApiConfig: ApiConfig, // The whole and current app configuration
    notification: NotificationHandler, // Notification handler that will be used for the provider
    accounts: AccountsAdapter<InjectedExtension, InjectedAccount>,
    apiPromise: ApiPromise,
    injectedExtension: InjectedExtension,
    wasmFactory: WasmFactory
  ): Promise<WebbPolkadot> {
    const provider = new PolkadotProvider(
      apiPromise,
      injectedExtension,
      new PolkaTXBuilder(apiPromise, notification, injectedExtension)
    );
    const chainId = await provider.api.consts.linkableTreeBn254.chainIdentifier;
    const typedChainId = calculateTypedChainId(
      ChainType.Substrate,
      chainId.toNumber()
    );

    const instance = new WebbPolkadot(
      apiPromise,
      typedChainId,
      injectedExtension,
      relayerBuilder,
      ApiConfig,
      notification,
      provider,
      accounts,
      wasmFactory
    );

    await instance.ensureApiInterface();
    /// check metadata update
    await instance.awaitMetaDataCheck();
    await apiPromise.isReady;

    const unsub = await instance.listenerBlocks();
    instance.newBlockSub.add(unsub);

    return instance;
  }

  static async getApiPromise(endpoint: string): Promise<ApiPromise> {
    return new Promise((resolve, reject) => {
      resolve(
        PolkadotProvider.getApiPromise('', [endpoint], (error) => reject(error))
      );
    });
  }

  async destroy(): Promise<void> {
    await this.provider.destroy();
    this.newBlockSub.forEach((unsub) => unsub());
  }

  private async listenerBlocks() {
    const block = await this.provider.api.query.system.number();
    this._newBlock.next(block.toNumber());
    const sub = await this.provider.api.rpc.chain.subscribeFinalizedHeads(
      (header) => {
        this._newBlock.next(header.number.toNumber());
      }
    );
    return sub;
  }

  get newBlock(): Observable<number | null> {
    return this._newBlock.asObservable();
  }

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
  }

  async getVAnchorLeaves(
    api: VAnchor | ApiPromise,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      treeId?: number;
      palletId?: number;
      tx?: Transaction<NewNotesTxResult>;
    }
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  }> {
    if (api instanceof VAnchor) {
      throw WebbError.from(WebbErrorCodes.UnsupportedProvider);
    }

    const { treeHeight, targetRoot, commitment, treeId, palletId, tx } =
      options;

    if (typeof treeId === 'undefined' || typeof palletId === 'undefined') {
      throw WebbError.from(WebbErrorCodes.InvalidArguments);
    }

    const chainId = api.consts.linkableTreeBn254.chainIdentifier.toNumber();
    const typedChainId = calculateTypedChainId(ChainType.Substrate, chainId);
    const chain = this.config.chains[typedChainId];

    const relayers = this.relayerManager.getRelayers({
      baseOn: 'substrate',
      chainId,
    });

    const leavesFromRelayers =
      await this.relayerManager.fetchLeavesFromRelayers(
        relayers,
        api,
        storage,
        {
          ...options,
          palletId,
          treeId,
        }
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
      // The end block number is the current block number
      const endBlock = await api.derive.chain.bestNumber();

      const queryBlock = lastQueriedBlock ? lastQueriedBlock + 1 : 0;

      console.log(
        `Query leaves from chain ${
          chain?.name ?? 'Unknown'
        } of tree id ${treeId} from block ${queryBlock} to ${endBlock.toNumber()}`
      );

      const leavesFromChain = await getLeaves(
        api,
        treeId,
        queryBlock,
        endBlock.toNumber()
      );

      const leavesFromChainHex = leavesFromChain
        .map((leaf) => u8aToHex(leaf))
        .filter((leaf) => leaf !== ZERO_BYTES32); // Filter out zero leaves

      // Merge the leaves from chain with the stored leaves
      // and fixed them to 32 bytes
      const leaves = [...storedLeaves, ...leavesFromChainHex].map((leaf) =>
        toFixedHex(leaf)
      );

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

      // Cached the new leaves if not local chain
      if (chain?.tag !== 'dev') {
        await storage.set('lastQueriedBlock', endBlock.toNumber());
        await storage.set('leaves', leaves);
      }

      return {
        provingLeaves,
        commitmentIndex: leafIndex,
      };
    }

    return leavesFromRelayers;
  }

  /**
   * Get the zero knowledge fixtures
   * @param maxEdges the max number of edges in the merkle tree
   * @param isSmall whether fixtures are for small inputs (less than or equal to 2 inputs)
   * @returns zk components
   */
  async getZkFixtures(
    maxEdges: number,
    isSmall?: boolean
  ): Promise<ZkComponents> {
    if (isSmall) {
      if (this.smallFixtures) {
        return this.smallFixtures;
      }

      const smallKey = await fetchVAnchorKeyFromAws(maxEdges, isSmall);

      const smallWasm = await fetchVAnchorWasmFromAws(maxEdges, isSmall);

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

    const largeWasm = await fetchVAnchorWasmFromAws(maxEdges, isSmall);

    const largeFixtures = {
      zkey: largeKey,
      wasm: Buffer.from(largeWasm),
      witnessCalculator: buildVariableWitnessCalculator,
    };

    this.largeFixtures = largeFixtures;
    return largeFixtures;
  }

  async getVAnchorMaxEdges(
    treeId: string,
    provider?: PublicClient | ApiPromise
  ): Promise<number> {
    // If provider is not instance of ApiPromise, display error and use `this.api` instead
    if (!(provider instanceof ApiPromise)) {
      console.error(
        '`provider` of the type `providers.Provider` is not supported in polkadot provider overriding to `this.api`'
      );
      provider = this.api;
    }

    const storedMaxEdges = this.vAnchorMaxEdges.get(treeId);
    if (storedMaxEdges) {
      return storedMaxEdges;
    }

    const api = provider || this.api;
    const maxEdges = await api.query.linkableTreeBn254.maxEdges(treeId);
    if (maxEdges.isEmpty) {
      console.error(`Max edges for tree ${treeId} is empty`);
      return 0;
    }

    this.vAnchorMaxEdges.set(treeId, maxEdges.toNumber());
    return maxEdges.toNumber();
  }

  async getVAnchorLevels(
    treeId: string,
    provider?: PublicClient | ApiPromise
  ): Promise<number> {
    if (!(provider instanceof ApiPromise)) {
      console.error(
        '`provider` of the type `providers.Provider` is not supported in polkadot provider overriding to `this.api`'
      );
      provider = this.api;
    }

    const storedLevels = this.vAnchorLevels.get(treeId);
    if (storedLevels) {
      return storedLevels;
    }

    const api = provider || this.api;
    const treeData = await api.query.merkleTreeBn254.trees(treeId);
    if (treeData.isNone) {
      throw WebbError.from(WebbErrorCodes.TreeNotFound);
    }

    const treeMedata = treeData.unwrap();
    const levels = treeMedata.depth.toNumber();

    this.vAnchorLevels.set(treeId, levels);

    return levels;
  }

  generateUtxo(input: UtxoGenInput): Promise<Utxo> {
    return CircomUtxo.generateUtxo(input);
  }
}
