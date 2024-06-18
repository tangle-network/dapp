// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import {
  Bridge,
  Currency,
  FixturesStatus,
  NewNotesTxResult,
  NotificationHandler,
  ProvideCapabilities,
  RelayChainMethods,
  TransactionExecutor,
  TransactionState,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
  WebbState,
  calculateProvingLeavesAndCommitmentIndex,
} from '@webb-tools/abstract-api-provider';
import calculateProgressPercentage from '@webb-tools/abstract-api-provider/utils/calculateProgressPercentage';
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
  LOCALNET_CHAIN_IDS,
  ZERO_BIG_INT,
  ensureHex,
  getAnchorDeploymentBlockNumber,
  walletsConfig,
} from '@webb-tools/dapp-config';
import maxBlockStepCfg from '@webb-tools/dapp-config/maxBlockStepConfig';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import {
  CurrencyRole,
  WalletId,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import Storage from '@webb-tools/dapp-types/Storage';
import { NoteManager } from '@webb-tools/note-manager';
import {
  CircomUtxo,
  Keypair,
  buildVariableWitnessCalculator,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { Note } from '@webb-tools/sdk-core/note';
import {
  ChainType,
  calculateTypedChainId,
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { Utxo, UtxoGenInput } from '@webb-tools/sdk-core/utxo';
import { Backend, ZkComponents, hexToU8a } from '@webb-tools/utils';
import assert from 'assert';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import values from 'lodash/values';
import { BehaviorSubject } from 'rxjs';
import {
  getContract,
  parseAbiItem,
  type Account,
  type Chain,
  type Client,
  type GetContractReturnType,
  type GetLogsReturnType,
  type Hash,
  type PublicClient,
  type Transport,
  type Client as ViemClient,
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
import VAnchor from './VAnchor';
import { Web3Accounts } from './ext-provider';
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

  private readonly _newBlock = new BehaviorSubject<null | bigint>(null);

  // Map to store the max edges for each vanchor address
  private readonly vAnchorMaxEdges = new Map<string, number>();

  // Map to store the vAnchor levels for each tree id
  private readonly vAnchorLevels = new Map<string, number>();

  private smallFixtures: ZkComponents | null = null;

  private largeFixtures: ZkComponents | null = null;

  private unsubscribeFns: Set<() => void>;

  readonly typedChainidSubject: BehaviorSubject<number>;

  readonly backend: Backend = 'Circom';

  readonly methods: WebbMethods<'web3', WebbApiProvider<WebbWeb3Provider>>;

  readonly relayChainMethods: RelayChainMethods<
    WebbApiProvider<WebbWeb3Provider>
  > | null;

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
    readonly relayerManager: Web3RelayerManager,
    readonly noteManager: NoteManager | null,
    readonly config: ApiConfig,
    readonly notificationHandler: NotificationHandler,
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

    // There are no relay chain methods for Web3 chains
    this.relayChainMethods = null;
    this.methods = {
      claim: {
        enabled: false,
        // TODO: Fix type casting here
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
        currencyConfig,
      );
    }

    // All supported bridges are supplied by the config, before passing to the state.
    const initialSupportedBridges: Record<number, Bridge> = {};

    for (const bridgeConfig of Object.values(config.bridgeByAsset)) {
      if (
        Object.keys(bridgeConfig.anchors).includes(
          calculateTypedChainId(ChainType.EVM, chainId).toString(),
        )
      ) {
        const bridgeCurrency = initialSupportedCurrencies[bridgeConfig.asset];
        const bridgeTargets = bridgeConfig.anchors;
        if (bridgeCurrency.getRole() === CurrencyRole.Governable) {
          initialSupportedBridges[bridgeConfig.asset] = new Bridge(
            bridgeCurrency,
            bridgeTargets,
          );
        }
      }
    }

    this.state = new WebbState(
      initialSupportedCurrencies,
      initialSupportedBridges,
    );

    // Select a reasonable default bridge
    this.state.activeBridge = Object.values(initialSupportedBridges)[0] ?? null;
  }

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    connector: Connector,
    chainId: number,
    relayerManager: Web3RelayerManager,
    noteManager: NoteManager | null,
    appConfig: ApiConfig,
    notification: NotificationHandler,
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
      relayerManager,
      noteManager,
      appConfig,
      notification,
      accounts,
    );
  }

  getProvider() {
    return this.walletClient;
  }

  getBlockNumber(): bigint | null {
    return this._newBlock.getValue();
  }

  // Web3 has the evm, so the "api interface" should always be available.
  async ensureApiInterface() {
    return Promise.resolve(true);
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
      interactiveFeedback: [],
      providerUpdate: [],
    };
  }

  async getChainId() {
    return this.connector.getChainId();
  }

  // VAnchors require zero knowledge proofs on deposit - Fetch the small and large circuits.
  getVAnchorContractByAddress(
    address: string,
  ): GetContractReturnType<typeof VAnchor__factory.abi, ViemClient> {
    return this.getVAnchorContractByAddressAndProvider(address);
  }

  getVAnchorContractByAddressAndProvider(
    address: string,
    provider?: PublicClient,
  ): GetContractReturnType<typeof VAnchor__factory.abi, ViemClient> {
    return getContract({
      abi: VAnchor__factory.abi,
      address: ensureHex(address),
      client: provider ?? this.publicClient,
    });
  }

  async getVAnchorLeaves(
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      ViemClient
    >,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      tx?: TransactionExecutor<NewNotesTxResult>;
    },
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  }> {
    const { tx, commitment, targetRoot, treeHeight } = options;

    const evmId = await vAnchorContract.read.getChainId();

    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      +evmId.toString(),
    );

    const anchorId = vAnchorContract.address;

    // First, try to fetch the leaves from the supported relayers
    const relayers = await this.relayerManager.getRelayersByChainAndAddress(
      typedChainId,
      anchorId,
    );

    const leavesFromRelayers =
      await this.relayerManager.fetchLeavesFromRelayers(
        relayers,
        vAnchorContract,
        storage,
        options,
      );

    // If unable to fetch leaves from the relayers, get them from chain
    if (!leavesFromRelayers || leavesFromRelayers.commitmentIndex === -1) {
      const isLocal = LOCALNET_CHAIN_IDS.includes(+`${evmId}`);

      // check if we already cached some values in the storage and the chain id is not local
      let lastQueriedBlock = !isLocal
        ? await storage.get('lastQueriedBlock')
        : 0;
      let storedLeaves = !isLocal ? await storage.get('leaves') : [];

      if (!isLocal) {
        const storedContractInfo: BridgeStorage = {
          lastQueriedBlock:
            (lastQueriedBlock ||
              getAnchorDeploymentBlockNumber(typedChainId, anchorId)) ??
            0,
          leaves: storedLeaves || [],
        };

        console.log('Stored contract info: ', storedContractInfo);

        lastQueriedBlock = storedContractInfo.lastQueriedBlock;
        storedLeaves = storedContractInfo.leaves;
      }

      const publicClient = getPublicClient(getWagmiConfig(), {
        chainId: +evmId.toString(),
      });

      assert(
        publicClient,
        WebbError.from(WebbErrorCodes.NoClientAvailable).message,
      );

      const leavesFromChain = await this.getDepositLeaves(
        BigInt(lastQueriedBlock + 1),
        ZERO_BIG_INT,
        // TODO: Fix type casting here
        publicClient as any,
        vAnchorContract,
        (fromBlock, toBlock, currentBlock) => {
          tx?.next(TransactionState.FetchingLeaves, {
            start: +fromBlock.toString(),
            end: +toBlock.toString(),
            current: +currentBlock.toString(),
          });
        },
      );

      // Merge the leaves from chain with the stored leaves
      // and fixed them to 32 bytes
      const leaves = [...storedLeaves, ...leavesFromChain.newLeaves].map(
        (leaf) => toFixedHex(leaf),
      );

      console.log(`Got ${leaves.length} leaves from chain`);

      tx?.next(TransactionState.ValidatingLeaves, undefined);
      // Validate the leaves
      const { leafIndex, provingLeaves } =
        await calculateProvingLeavesAndCommitmentIndex(
          treeHeight,
          leaves,
          targetRoot,
          commitment.toString(),
        );

      // If the leafIndex is -1, it means the commitment is not in the tree
      // and we should continue to the next relayer
      if (leafIndex === -1) {
        tx?.next(TransactionState.ValidatingLeaves, false);
      } else {
        tx?.next(TransactionState.ValidatingLeaves, true);
      }

      // Cached all the leaves to re-use them later if not localnet
      if (!isLocal) {
        await storage.set(
          'lastQueriedBlock',
          +leavesFromChain.lastQueriedBlock.toString(),
        );
        await storage.set('leaves', leaves);
      }

      // Return the leaves for proving and the commitment index
      return {
        provingLeaves,
        commitmentIndex: leafIndex,
      };
    }

    return leavesFromRelayers;
  }

  async getVAnchorNotesFromChain(
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      ViemClient
    >,
    owner: Keypair,
    startingBlockArg?: bigint,
    abortSignal?: AbortSignal,
  ): Promise<Note[]> {
    const evmId = await vAnchorContract.read.getChainId();
    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      +evmId.toString(),
    );

    const tokenSymbol = this.methods.bridgeApi.getCurrency();
    if (!tokenSymbol) {
      throw new Error('Currency not found'); // Development error
    }

    abortSignal?.throwIfAborted();

    const anchorId = vAnchorContract.address;
    const startingBlock =
      startingBlockArg ??
      BigInt(getAnchorDeploymentBlockNumber(typedChainId, anchorId) || 1);

    const utxos = await this.getSpendableUtxosFromChain(
      owner,
      startingBlock,
      vAnchorContract,
      (fromBlock, toBlock, currenctBlock) => {
        const fromBlockNumber = +fromBlock.toString();
        const toBlockNumber = +toBlock.toString();
        const currenctBlockNumber = +currenctBlock.toString();

        const progress = calculateProgressPercentage(
          fromBlockNumber,
          toBlockNumber,
          currenctBlockNumber,
        );

        NoteManager.syncNotesProgress = progress;
      },
      abortSignal,
    );

    console.log(`Found ${utxos.length} UTXOs on chain`);

    abortSignal?.throwIfAborted();

    const notes = Promise.all(
      utxos.map(async (utxo) => {
        abortSignal?.throwIfAborted();

        console.log(utxo.serialize());

        return await NoteManager.noteFromUtxo(
          utxo,
          this.backend,
          typedChainId,
          anchorId,
          anchorId,
          tokenSymbol.view.symbol,
        );
      }),
    );

    // Reset the progress
    NoteManager.syncNotesProgress = Number.NaN;

    abortSignal?.throwIfAborted();

    return notes;
  }

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
  }

  get capabilities(): ProvideCapabilities {
    const connector = this.connector;

    if (connector.name === walletsConfig[WalletId.WalletConnectV2].name) {
      return {
        addNetworkRpc: false,
        hasSessions: true,
        listenForAccountChange: false,
        listenForChainChane: false,
      } satisfies ProvideCapabilities;
    } else {
      return {
        addNetworkRpc: true,
        hasSessions: false,
        listenForAccountChange: true,
        listenForChainChane: true,
      } satisfies ProvideCapabilities;
    }
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

  async watchAsset(currency: Currency, imgUrl?: string) {
    const addr = currency.getAddressOfChain(this.typedChainId);
    if (!addr) {
      throw WebbError.from(WebbErrorCodes.NoCurrencyAvailable);
    }

    return this.walletClient.watchAsset({
      type: 'ERC20',
      options: {
        address: addr,
        decimals: currency.getDecimals(),
        // Slice the symbol to 10 characters to avoid overflow
        symbol: currency.view.symbol.slice(0, 10),
        image: imgUrl,
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

  async getZkFixtures(
    maxEdges: number,
    isSmall = false,
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
        dummyAbortSignal,
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
      dummyAbortSignal,
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
    provider?: ViemClient | ApiPromise,
  ): Promise<number> {
    if (provider instanceof ApiPromise || !provider) {
      throw WebbError.from(WebbErrorCodes.UnsupportedProvider);
    }

    const storedMaxEdges = this.vAnchorMaxEdges.get(vAnchorAddress);
    if (storedMaxEdges) {
      return Promise.resolve(storedMaxEdges);
    }

    const vAnchorContract = getContract({
      address: `0x${vAnchorAddress.replace(/^0x/, '')}`,
      abi: VAnchor__factory.abi,
      client: provider,
    });

    const maxEdges = await vAnchorContract.read.maxEdges();

    this.vAnchorMaxEdges.set(vAnchorAddress, maxEdges);
    return maxEdges;
  }

  async getVAnchorLevels(
    vAnchorAddressOrTreeId: string,
    provider?: ApiPromise | PublicClient,
  ): Promise<number> {
    if (provider instanceof ApiPromise || !provider) {
      throw WebbError.from(WebbErrorCodes.UnsupportedProvider);
    }

    const storedLevels = this.vAnchorLevels.get(vAnchorAddressOrTreeId);
    if (storedLevels) {
      return Promise.resolve(storedLevels);
    }

    const vAnchorContract = getContract({
      address: `0x${vAnchorAddressOrTreeId.replace(/^0x/, '')}`,
      abi: VAnchor__factory.abi,
      client: provider,
    });
    const levels = await vAnchorContract.read.getLevels();

    this.vAnchorLevels.set(vAnchorAddressOrTreeId, levels);
    return levels;
  }

  generateUtxo(input: UtxoGenInput): Promise<Utxo> {
    return CircomUtxo.generateUtxo(input);
  }

  /**
   * The the VAnchor instance for the the logic inside this class,
   * we not use this for signing transactions. In the future we will
   * refactor the VAnchor class itself not require a signer.
   * @param address the address of the vAnchor contract
   * @param provider the viem public client to use
   * @param tx the transaction to update the transaction state
   * @param useDummyFixtures whether to use dummy fixtures or not
   */
  async getVAnchorInstance(
    address: string,
    provider: ViemClient,
    tx?: TransactionExecutor<NewNotesTxResult>,
    useDummyFixtures?: boolean,
  ): Promise<VAnchor> {
    if (useDummyFixtures) {
      const dummyFixtures = {
        wasm: Buffer.from(''),
        zkey: new Uint8Array(),
        witnessCalculator: null,
      } satisfies ZkComponents;

      return VAnchor.connect(
        ensureHex(address),
        dummyFixtures,
        dummyFixtures,
        provider,
      );
    }

    const maxEdges = await this.getVAnchorMaxEdges(address, provider);

    const fixturesList = new Map<string, FixturesStatus>();

    fixturesList.set('small fixtures', 'Waiting');
    tx?.next(TransactionState.FetchingFixtures, {
      fixturesList,
    });

    const smallZkFixtures = await this.getZkFixtures(maxEdges, true);

    fixturesList.set('small fixtures', 'Done');
    tx?.next(TransactionState.FetchingFixtures, {
      fixturesList,
    });

    fixturesList.set('large fixtures', 'Waiting');
    tx?.next(TransactionState.FetchingFixtures, {
      fixturesList,
    });

    const largeZkFixtures = await this.getZkFixtures(maxEdges, false);

    fixturesList.set('large fixtures', 'Done');
    tx?.next(TransactionState.FetchingFixtures, {
      fixturesList,
    });

    return VAnchor.connect(
      ensureHex(address),
      smallZkFixtures,
      largeZkFixtures,
      provider,
    );
  }

  /**
   * Get the logs from the vAnchor contract
   * from `fromBlock` to `toBlock`
   * or at block (`fromBlock === toBlock`) and filter them
   * by the `NewCommitment` event.
   * @param publicClient the public client to use
   * @param vAnchorAddress the address of the vAnchor contract
   * @param fromBlock the block to start fetching logs from
   * @param toBlock the block to stop fetching logs from (exclusive)
   * @param onCurrentProcessingBlock a callback to call when the current processing block changes
   * @returns the filtered logs
   */
  async getNewCommitmentLogs<
    transport extends Transport,
    chain extends Chain,
    TClient extends PublicClient<transport, chain>,
    TVAnchorContract extends GetContractReturnType<
      typeof VAnchor__factory.abi,
      Client
    >,
  >(
    publicClient: TClient,
    vAnchorContract: TVAnchorContract,
    fromBlock: bigint,
    toBlock: bigint,
    onCurrentProcessingBlock?: (block: bigint) => void,
    abortSignal?: AbortSignal,
  ) {
    const isTheSameBlock = fromBlock === toBlock;

    const chainId = await vAnchorContract.read.getChainId();
    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      +chainId.toString(),
    );

    const maxBlockStep =
      maxBlockStepCfg[typedChainId] ?? maxBlockStepCfg.default;

    // TODO: use the abi from the contract
    const event = parseAbiItem(
      'event NewCommitment(uint256 commitment, uint256 subTreeIndex,uint256 leafIndex, bytes encryptedOutput)',
    );

    const commonGetLogsProps = {
      address: vAnchorContract.address,
      event,
      strict: true,
    } as const;

    abortSignal?.throwIfAborted();

    if (isTheSameBlock || toBlock - fromBlock <= maxBlockStep) {
      onCurrentProcessingBlock?.(fromBlock);
      // Use getLogs instead of createEventFilter.NewCommitment because
      // createEventFilter.NewCommitment does not work without wss connection
      return retryPromise(
        () =>
          publicClient.getLogs({
            ...commonGetLogsProps,
            fromBlock,
            toBlock,
          }),
        undefined,
        undefined,
        abortSignal,
      );
    }

    const logs: GetLogsReturnType<typeof event, [typeof event], true> = [];

    // We loop through the blocks in chunks to avoid hitting the max block step limit
    let currentBlock = fromBlock;

    while (currentBlock < toBlock) {
      const maybeToBlock = currentBlock + BigInt(maxBlockStep) - BigInt(1);
      const _toBlock = maybeToBlock > toBlock ? toBlock : maybeToBlock;

      console.log(
        `Fetching logs from block ${currentBlock} to block ${_toBlock}`,
      );

      onCurrentProcessingBlock?.(currentBlock);

      const logsChunk = await retryPromise(
        () =>
          publicClient.getLogs({
            ...commonGetLogsProps,
            fromBlock: currentBlock,
            toBlock: _toBlock,
          }),
        undefined,
        undefined,
        abortSignal,
      );

      logs.push(...logsChunk);

      currentBlock += BigInt(maxBlockStep);
    }

    return logs;
  }

  // ================== PRIVATE METHODS ===================

  /**
   * Refactor from https://github.com/webb-tools/protocol-solidity/blob/main/packages/anchors/src/VAnchor.ts#L663
   * when migrating to wagmi and viem
   */
  private async getDepositLeaves<
    transport extends Transport,
    chain extends Chain,
    TClient extends PublicClient<transport, chain>,
    TVAnchorContract extends GetContractReturnType<
      typeof VAnchor__factory.abi,
      Client
    >,
  >(
    startingBlock: bigint,
    finalBlockArg: bigint,
    publicClient: TClient,
    vAnchorContract: TVAnchorContract,
    onBlockProcessed?: (
      fromBlock: bigint,
      toBlock: bigint,
      currentBlock: bigint,
    ) => void,
  ): Promise<{ lastQueriedBlock: bigint; newLeaves: Array<Hash> }> {
    const latestBlock = finalBlockArg || (await publicClient.getBlockNumber());

    const logs = await this.getNewCommitmentLogs(
      // TODO: Fix type casting here
      publicClient as any,
      vAnchorContract,
      startingBlock,
      latestBlock,
      (currentBlock) =>
        onBlockProcessed?.(startingBlock, latestBlock, currentBlock),
    );

    return {
      lastQueriedBlock: latestBlock,
      newLeaves: logs.map((log) => ensureHex(log.args.commitment.toString(16))),
    };
  }

  /**
   * Refactor from https://github.com/webb-tools/protocol-solidity/blob/main/packages/anchors/src/VAnchor.ts#L716
   * when migrating to wagmi and viem
   */
  private async getSpendableUtxosFromChain(
    owner: Keypair,
    startingBlock: bigint,
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      ViemClient
    >,
    onBlockProcessed?: (
      fromBlock: bigint,
      toBlock: bigint,
      currentBlock: bigint,
    ) => void,
    abortSignal?: AbortSignal,
  ): Promise<Array<Utxo>> {
    const chainId = await vAnchorContract.read.getChainId();
    const publicClient = getPublicClient(getWagmiConfig(), {
      chainId: +chainId.toString(),
    });

    if (!publicClient) {
      throw WebbError.from(WebbErrorCodes.NoClientAvailable);
    }

    const latestBlock = await publicClient.getBlockNumber();

    const logs = await this.getNewCommitmentLogs(
      // TODO: Fix type casting here
      publicClient as any,
      vAnchorContract,
      startingBlock,
      latestBlock,
      (currentBlock) =>
        onBlockProcessed?.(startingBlock, latestBlock, currentBlock),
      abortSignal,
    );

    const parsedLogs = logs.map((log) => ({
      encryptedOutput: log.args.encryptedOutput,
      leafIndex: log.args.leafIndex,
    }));

    abortSignal?.throwIfAborted();

    const utxosWithNull = await Promise.all(
      parsedLogs.map(({ encryptedOutput, leafIndex }) =>
        this.validateAmountEncryptedOutput(owner, encryptedOutput, leafIndex),
      ),
    );

    const filteredUtxos = utxosWithNull.filter(
      (utxo): utxo is Utxo => utxo !== null,
    );

    const spendableUtxos = await this.validateIsSpent(
      filteredUtxos,
      vAnchorContract.address,
    );

    abortSignal?.throwIfAborted();

    return spendableUtxos;
  }

  /**
   * Validates the on-chain encrypted output whether the amount is not `0
   * @param encryptedOutput the fetched encrypted output from the chain
   * @param vAnchorContract the vAnchor contract instance
   * @returns the decrypted output if the validation passes, otherwise `null`
   */
  private async validateAmountEncryptedOutput(
    owner: Keypair,
    encryptedOutput: Hash,
    leafIndex: bigint,
  ): Promise<Utxo | null> {
    try {
      const decryptedUtxo = await CircomUtxo.decrypt(owner, encryptedOutput);

      // In order to properly calculate the nullifier, an index is required.
      // The decrypt function generates a utxo without an index, and the index is a readonly property.
      // So, regenerate the utxo with the proper index.
      const regeneratedUtxo = await this.generateUtxo({
        amount: decryptedUtxo.amount,
        backend: 'Circom',
        blinding: hexToU8a(decryptedUtxo.blinding),
        chainId: decryptedUtxo.chainId,
        curve: 'Bn254',
        keypair: owner,
      });

      const idx = decryptedUtxo.index || +leafIndex.toString();

      regeneratedUtxo.setIndex(idx);

      if (BigInt(regeneratedUtxo.amount) === ZERO_BIG_INT) {
        return null;
      }

      return regeneratedUtxo;
    } catch {
      return null;
    }
  }

  /**
   * Validates the on-chain nullifier whether it is spent or not
   * @param nullifiers the list of nullifiers to validate
   * @param vAnchorContract the current connected vAnchor contract
   * @returns an array of boolean values, where `true` means the nullifier is spent, otherwise `false`
   */
  private async validateIsSpent(
    utxos: ReadonlyArray<Utxo>,
    vAnchorIdentifier: string,
  ): Promise<Array<Utxo>> {
    // Get record of chainId -> Utxos
    const utxosByChainId = groupBy(
      utxos,
      (utxo) => parseTypedChainId(+utxo.chainId).chainId,
    );

    // Get record of chainId -> contract instance
    const vAnchorContractsByChainId = Object.keys(utxosByChainId).reduce(
      (acc, chainIdStr) => {
        const chainId = +chainIdStr;

        const client = getPublicClient(getWagmiConfig(), {
          chainId,
        });

        if (!client) {
          throw WebbError.from(WebbErrorCodes.NoClientAvailable);
        }

        if (!acc[chainId]) {
          acc[chainId] = getContract({
            address: ensureHex(vAnchorIdentifier),
            abi: VAnchor__factory.abi,
            client,
          });
        }

        return acc;
      },
      {} as Record<
        number,
        GetContractReturnType<typeof VAnchor__factory.abi, ViemClient>
      >,
    );

    // Use the contract instance to validate the nullifiers
    // by calling isSpentArray and get the non-spent utxos
    const nonSpentUtxosByChainId = await Promise.all(
      Object.entries(vAnchorContractsByChainId).map(
        async ([chainId, vAnchorContract]) => {
          const nullifiers = utxosByChainId[chainId].map((utxo) =>
            BigInt(ensureHex(utxo.nullifier)),
          );

          const isSpentArray = await vAnchorContract.read.isSpentArray([
            nullifiers,
          ]);

          return utxosByChainId[chainId].filter(
            (_, index) => !isSpentArray[index],
          );
        },
      ),
    );

    // Flatten the array of arrays
    return flatten(nonSpentUtxosByChainId);
  }
}
