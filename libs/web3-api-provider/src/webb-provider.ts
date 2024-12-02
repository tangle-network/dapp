// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import {
  Bridge,
  Currency,
  NotificationHandler,
  ProvideCapabilities,
  WebbApiProvider,
  WebbMethods,
  WebbProviderEvents,
} from '@webb-tools/abstract-api-provider';
import { EventBus } from '@webb-tools/app-util';
import { retryPromise } from '@webb-tools/browser-utils';
import { BridgeStorage } from '@webb-tools/browser-utils/storage';
import { VAnchor__factory } from '@webb-tools/contracts';
import { ApiConfig, ensureHex, walletsConfig } from '@webb-tools/dapp-config';
import maxBlockStepCfg from '@webb-tools/dapp-config/maxBlockStepConfig';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import {
  CurrencyRole,
  WalletId,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import Storage from '@webb-tools/dapp-types/Storage';
import { CircomUtxo, Keypair, Utxo, UtxoGenInput } from '@webb-tools/sdk-core';
import { Note } from '@webb-tools/sdk-core/note';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import assert from 'assert';
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
import { Web3ChainQuery } from './webb-provider/chain-query';
import { Web3VAnchorActions } from './webb-provider/vanchor-actions';

export class WebbWeb3Provider
  extends EventBus<WebbProviderEvents<[number]>>
  implements WebbApiProvider<WebbWeb3Provider>
{
  readonly type = 'web3';

  private readonly _newBlock = new BehaviorSubject<null | bigint>(null);

  // Map to store the max edges for each vanchor address
  private readonly vAnchorMaxEdges = new Map<string, number>();

  // Map to store the vAnchor levels for each tree id
  private readonly vAnchorLevels = new Map<string, number>();

  private unsubscribeFns: Set<() => void>;

  readonly typedChainidSubject: BehaviorSubject<number>;

  readonly methods: WebbMethods<'web3', WebbApiProvider<WebbWeb3Provider>>;

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

    this.methods = {
      chainQuery: new Web3ChainQuery(this),
      variableAnchor: {
        actions: {
          enabled: true,
          inner: new Web3VAnchorActions(this),
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
  }

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    connector: Connector,
    chainId: number,
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
    _vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      ViemClient
    >,
    _storage: Storage<BridgeStorage>,
    _options: {
      treeHeight: number;
      targetRoot: string;
      commitment: bigint;
    },
  ): Promise<{
    provingLeaves: string[];
    commitmentIndex: number;
  }> {
    return {
      provingLeaves: [],
      commitmentIndex: 0,
    };
  }

  async getVAnchorNotesFromChain(
    _vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      ViemClient
    >,
    _owner: Keypair,
    _startingBlockArg?: bigint,
    _abortSignal?: AbortSignal,
  ): Promise<Note[]> {
    return [];
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
    useDummyFixtures?: boolean,
  ): Promise<VAnchor> {
    if (useDummyFixtures) {
      return VAnchor.connect(ensureHex(address), provider);
    }

    return VAnchor.connect(ensureHex(address), provider);
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
}
