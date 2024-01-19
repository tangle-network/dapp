// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { getConfig } from '@wagmi/core';
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
  SupportedConnector,
  ZERO_BIG_INT,
  ensureHex,
  getAnchorDeploymentBlockNumber,
} from '@webb-tools/dapp-config';
import maxBlockStepCfg from '@webb-tools/dapp-config/maxBlockStepConfig';
import {
  CurrencyRole,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import Storage from '@webb-tools/dapp-types/Storage';
import { NoteManager } from '@webb-tools/note-manager';
import {
  CircomUtxo,
  buildVariableWitnessCalculator,
  toFixedHex,
} from '@webb-tools/sdk-core';
import { Keypair } from '@webb-tools/sdk-core/keypair';
import { Note } from '@webb-tools/sdk-core/note';
import {
  ChainType,
  calculateTypedChainId,
  parseTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { Utxo, UtxoGenInput } from '@webb-tools/sdk-core/utxo';
import { ZkComponents, hexToU8a, Backend } from '@webb-tools/utils';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import { BehaviorSubject } from 'rxjs';
import {
  GetContractReturnType,
  GetLogsReturnType,
  Hash,
  PublicClient,
  SwitchChainError,
  WalletClient,
  getContract,
  parseAbiItem,
} from 'viem';
import {
  connect,
  getPublicClient,
  watchAccount,
  watchBlockNumber,
  watchNetwork,
} from 'wagmi/actions';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import VAnchor from './VAnchor';
import { Web3Accounts } from './ext-provider';
import { Web3BridgeApi } from './webb-provider/bridge-api';
import { Web3ChainQuery } from './webb-provider/chain-query';
import { Web3RelayerManager } from './webb-provider/relayer-manager';
import { Web3VAnchorActions } from './webb-provider/vanchor-actions';
import { Web3WrapUnwrap } from './webb-provider/wrap-unwrap';
import {
  MetaMaskConnector,
  RainbowConnector,
} from '@webb-tools/dapp-config/wallets/injected';

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
  readonly publicClient: PublicClient;

  get newBlock() {
    return this._newBlock.asObservable();
  }

  private constructor(
    readonly connector: SupportedConnector,
    readonly walletClient: WalletClient,
    protected chainId: number,
    readonly relayerManager: Web3RelayerManager,
    readonly noteManager: NoteManager | null,
    readonly config: ApiConfig,
    readonly notificationHandler: NotificationHandler,
    readonly accounts: Web3Accounts
  ) {
    super();

    const typedChainId = calculateTypedChainId(ChainType.EVM, chainId);
    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    this.publicClient = getPublicClient({ chainId });

    this.unsubscribeFns = new Set();

    const unsub = watchBlockNumber(
      { chainId, listen: true },
      (nextBlockNumber) => {
        this._newBlock.next(nextBlockNumber);
      }
    );

    this.unsubscribeFns.add(unsub);

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

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    requestConnector: SupportedConnector,
    chainId: number,
    relayerManager: Web3RelayerManager,
    noteManager: NoteManager | null,
    appConfig: ApiConfig,
    notification: NotificationHandler
  ) {
    let connector = requestConnector;

    const cfg = getConfig();
    if (cfg.connector !== connector) {
      const { connector: connector_, chain } = await connect({
        chainId,
        connector: requestConnector,
      });

      if (chain.unsupported) {
        throw WebbError.from(WebbErrorCodes.UnsupportedChain);
      }

      if (!connector_) {
        throw WebbError.from(WebbErrorCodes.NoConnectorConfigured);
      }

      connector = connector_ as SupportedConnector;
    } else {
      // If the connector is already configured, we need to make sure it's connected.
      const { chain } = await connector.connect({ chainId });
      if (chain.unsupported) {
        throw WebbError.from(WebbErrorCodes.UnsupportedWallet);
      }
    }

    const walletClient = await connector.getWalletClient({ chainId });

    const accounts = new Web3Accounts(walletClient);

    return new WebbWeb3Provider(
      connector as SupportedConnector, // TODO: Remove the cast
      walletClient,
      chainId,
      relayerManager,
      noteManager,
      appConfig,
      notification,
      accounts
    );
  }

  getProvider(): WalletClient {
    return this.walletClient;
  }

  getBlockNumber(): bigint | null {
    return this._newBlock.getValue();
  }

  // Web3 has the evm, so the "api interface" should always be available.
  async ensureApiInterface(): Promise<boolean> {
    return Promise.resolve(true);
  }

  setChainListener() {
    const unsub = watchNetwork(({ chain }) => {
      if (!chain) {
        return;
      }

      this.emit('providerUpdate', [chain.id]);
    });

    this.unsubscribeFns.add(unsub);

    return unsub;
  }

  setAccountListener() {
    const unsub = watchAccount(async () => {
      this.emit('newAccounts', this.accounts);
    });

    this.unsubscribeFns.add(unsub);

    return unsub;
  }

  async destroy(): Promise<void> {
    await this.endSession();
    this.subscriptions = {
      interactiveFeedback: [],
      providerUpdate: [],
    };
  }

  async getChainId(): Promise<number> {
    return this.walletClient.getChainId();
  }

  // VAnchors require zero knowledge proofs on deposit - Fetch the small and large circuits.
  getVAnchorContractByAddress(
    address: string
  ): GetContractReturnType<typeof VAnchor__factory.abi, PublicClient> {
    return this.getVAnchorContractByAddressAndProvider(address);
  }

  getVAnchorContractByAddressAndProvider(
    address: string,
    provider?: PublicClient
  ): GetContractReturnType<typeof VAnchor__factory.abi, PublicClient> {
    return getContract({
      abi: VAnchor__factory.abi,
      address: ensureHex(address),
      publicClient: provider ?? this.publicClient,
    });
  }

  async getVAnchorLeaves(
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      PublicClient
    >,
    storage: Storage<BridgeStorage>,
    options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
      tx?: TransactionExecutor<NewNotesTxResult>;
    }
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  }> {
    const { tx, commitment, targetRoot, treeHeight } = options;

    const evmId = await vAnchorContract.read.getChainId();

    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      +evmId.toString()
    );

    const anchorId = vAnchorContract.address;

    // First, try to fetch the leaves from the supported relayers
    const relayers = await this.relayerManager.getRelayersByChainAndAddress(
      typedChainId,
      anchorId
    );

    const leavesFromRelayers =
      await this.relayerManager.fetchLeavesFromRelayers(
        relayers,
        vAnchorContract,
        storage,
        options
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

      const leavesFromChain = await this.getDepositLeaves(
        BigInt(lastQueriedBlock + 1),
        ZERO_BIG_INT,
        getPublicClient({ chainId: +evmId.toString() }),
        vAnchorContract,
        (fromBlock, toBlock, currentBlock) => {
          tx?.next(TransactionState.FetchingLeaves, {
            start: +fromBlock.toString(),
            end: +toBlock.toString(),
            current: +currentBlock.toString(),
          });
        }
      );

      // Merge the leaves from chain with the stored leaves
      // and fixed them to 32 bytes
      const leaves = [...storedLeaves, ...leavesFromChain.newLeaves].map(
        (leaf) => toFixedHex(leaf)
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

      // Cached all the leaves to re-use them later if not localnet
      if (!isLocal) {
        await storage.set(
          'lastQueriedBlock',
          +leavesFromChain.lastQueriedBlock.toString()
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
      PublicClient
    >,
    owner: Keypair,
    startingBlockArg?: bigint,
    abortSignal?: AbortSignal
  ): Promise<Note[]> {
    const evmId = await vAnchorContract.read.getChainId();
    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      +evmId.toString()
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
          currenctBlockNumber
        );

        NoteManager.syncNotesProgress = progress;
      },
      abortSignal
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
          tokenSymbol.view.symbol
        );
      })
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

    if (
      connector instanceof MetaMaskConnector ||
      connector instanceof RainbowConnector
    ) {
      return {
        addNetworkRpc: true,
        hasSessions: false,
        listenForAccountChange: true,
        listenForChainChane: true,
      } satisfies ProvideCapabilities;
    } else if (connector instanceof WalletConnectConnector) {
      return {
        addNetworkRpc: false,
        hasSessions: true,
        listenForAccountChange: false,
        listenForChainChane: false,
      } satisfies ProvideCapabilities;
    }

    console.error(
      WebbError.getErrorMessage(WebbErrorCodes.NoConnectorConfigured).message
    );

    // Default to false
    return {
      addNetworkRpc: false,
      hasSessions: false,
      listenForAccountChange: false,
      listenForChainChane: false,
    } satisfies ProvideCapabilities;
  }

  async endSession(): Promise<void> {
    this.unsubscribeFns.forEach((unsub) => unsub());
    return this.unsubscribeAll();
  }

  async switchOrAddChain(evmChainId: number) {
    try {
      await this.walletClient.switchChain({ id: evmChainId });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (error instanceof SwitchChainError) {
        await this.walletClient.addChain({
          chain: this.config.chains[this.typedChainId],
        });
      } else {
        throw error; // Otherwise, throw the error to be handled by the caller.
      }
    }
    return;
  }

  async watchAsset(currency: Currency, imgUrl?: string) {
    const addr = currency.getAddressOfChain(this.typedChainId);
    if (!addr) {
      throw WebbError.from(WebbErrorCodes.NoCurrencyAvailable);
    }

    this.walletClient.watchAsset({
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

    return this.walletClient.signMessage({
      account: ensureHex(account.address),
      message,
    });
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
    provider?: PublicClient | ApiPromise
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
      publicClient: provider,
    });

    const maxEdges = await vAnchorContract.read.maxEdges();

    this.vAnchorMaxEdges.set(vAnchorAddress, maxEdges);
    return maxEdges;
  }

  async getVAnchorLevels(
    vAnchorAddressOrTreeId: string,
    provider?: ApiPromise | PublicClient
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
      publicClient: provider,
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
    provider: PublicClient,
    tx?: TransactionExecutor<NewNotesTxResult>,
    useDummyFixtures?: boolean
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
        provider
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
      provider
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
  async getNewCommitmentLogs(
    publicClient: PublicClient,
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      PublicClient
    >,
    fromBlock: bigint,
    toBlock: bigint,
    onCurrentProcessingBlock?: (block: bigint) => void,
    abortSignal?: AbortSignal
  ) {
    const isTheSameBlock = fromBlock === toBlock;

    const chainId = await vAnchorContract.read.getChainId();
    const typedChainId = calculateTypedChainId(
      ChainType.EVM,
      +chainId.toString()
    );

    const maxBlockStep =
      maxBlockStepCfg[typedChainId] ?? maxBlockStepCfg.default;

    // TODO: use the abi from the contract
    const event = parseAbiItem(
      'event NewCommitment(uint256 commitment, uint256 subTreeIndex,uint256 leafIndex, bytes encryptedOutput)'
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
        abortSignal
      );
    }

    const logs: GetLogsReturnType<typeof event, [typeof event], true> = [];

    // We loop through the blocks in chunks to avoid hitting the max block step limit
    let currentBlock = fromBlock;

    while (currentBlock < toBlock) {
      const maybeToBlock = currentBlock + BigInt(maxBlockStep) - BigInt(1);
      const _toBlock = maybeToBlock > toBlock ? toBlock : maybeToBlock;

      console.log(
        `Fetching logs from block ${currentBlock} to block ${_toBlock}`
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
        abortSignal
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
  private async getDepositLeaves(
    startingBlock: bigint,
    finalBlockArg: bigint,
    publicClient: PublicClient,
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      PublicClient
    >,
    onBlockProcessed?: (
      fromBlock: bigint,
      toBlock: bigint,
      currentBlock: bigint
    ) => void
  ): Promise<{ lastQueriedBlock: bigint; newLeaves: Array<Hash> }> {
    const latestBlock = finalBlockArg || (await publicClient.getBlockNumber());

    const logs = await this.getNewCommitmentLogs(
      publicClient,
      vAnchorContract,
      startingBlock,
      latestBlock,
      (currentBlock) =>
        onBlockProcessed?.(startingBlock, latestBlock, currentBlock)
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
      PublicClient
    >,
    onBlockProcessed?: (
      fromBlock: bigint,
      toBlock: bigint,
      currentBlock: bigint
    ) => void,
    abortSignal?: AbortSignal
  ): Promise<Array<Utxo>> {
    const chainId = await vAnchorContract.read.getChainId();
    const publicClient = getPublicClient({
      chainId: +chainId.toString(),
    });

    const latestBlock = await publicClient.getBlockNumber();

    const logs = await this.getNewCommitmentLogs(
      publicClient,
      vAnchorContract,
      startingBlock,
      latestBlock,
      (currentBlock) =>
        onBlockProcessed?.(startingBlock, latestBlock, currentBlock),
      abortSignal
    );

    const parsedLogs = logs.map((log) => ({
      encryptedOutput: log.args.encryptedOutput,
      leafIndex: log.args.leafIndex,
    }));

    abortSignal?.throwIfAborted();

    const utxosWithNull = await Promise.all(
      parsedLogs.map(({ encryptedOutput, leafIndex }) =>
        this.validateAmountEncryptedOutput(owner, encryptedOutput, leafIndex)
      )
    );

    const filteredUtxos = utxosWithNull.filter(
      (utxo): utxo is Utxo => utxo !== null
    );

    const spendableUtxos = await this.validateIsSpent(
      filteredUtxos,
      vAnchorContract.address
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
    leafIndex: bigint
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
    } catch (e) {
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
    vAnchorIdentifier: string
  ): Promise<Array<Utxo>> {
    // Get record of chainId -> Utxos
    const utxosByChainId = groupBy(
      utxos,
      (utxo) => parseTypedChainId(+utxo.chainId).chainId
    );

    // Get record of chainId -> contract instance
    const vAnchorContractsByChainId = Object.keys(utxosByChainId).reduce(
      (acc, chainIdStr) => {
        const chainId = +chainIdStr;

        if (!acc[chainId]) {
          acc[chainId] = getContract({
            address: ensureHex(vAnchorIdentifier),
            abi: VAnchor__factory.abi,
            publicClient: getPublicClient({ chainId }),
          });
        }

        return acc;
      },
      {} as Record<
        number,
        GetContractReturnType<typeof VAnchor__factory.abi, PublicClient>
      >
    );

    // Use the contract instance to validate the nullifiers
    // by calling isSpentArray and get the non-spent utxos
    const nonSpentUtxosByChainId = await Promise.all(
      Object.entries(vAnchorContractsByChainId).map(
        async ([chainId, vAnchorContract]) => {
          const nullifiers = utxosByChainId[chainId].map((utxo) =>
            BigInt(ensureHex(utxo.nullifier))
          );

          const isSpentArray = await vAnchorContract.read.isSpentArray([
            nullifiers,
          ]);

          return utxosByChainId[chainId].filter(
            (_, index) => !isSpentArray[index]
          );
        }
      )
    );

    // Flatten the array of arrays
    return flatten(nonSpentUtxosByChainId);
  }
}
