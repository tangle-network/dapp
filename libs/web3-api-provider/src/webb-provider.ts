// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import {
  Bridge,
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
  WebbState,
  calculateProvingLeavesAndCommitmentIndex,
} from '@webb-tools/abstract-api-provider';
import { EventBus } from '@webb-tools/app-util';
import { BridgeStorage } from '@webb-tools/browser-utils/storage';
import { VAnchor__factory } from '@webb-tools/contracts';
import {
  ApiConfig,
  SupportedConnector,
  ZERO_BIG_INT,
  ensureHex,
  getAnchorDeploymentBlockNumber,
} from '@webb-tools/dapp-config';
import {
  CurrencyRole,
  WebbError,
  WebbErrorCodes,
} from '@webb-tools/dapp-types';
import {
  fetchVAnchorKeyFromAws,
  fetchVAnchorWasmFromAws,
} from '@webb-tools/fixtures-deployments';
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
import { Storage } from '@webb-tools/storage';
import { ZkComponents, hexToU8a } from '@webb-tools/utils';
import type { Backend } from '@webb-tools/wasm-utils';
import { BehaviorSubject } from 'rxjs';
import {
  GetContractReturnType,
  Hash,
  PublicClient,
  SwitchChainError,
  WalletClient,
  getContract,
} from 'viem';
import {
  connect,
  getPublicClient,
  switchNetwork,
  watchAccount,
  watchBlockNumber,
  watchNetwork,
} from 'wagmi/actions';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
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
    readonly accounts: Web3Accounts,
    readonly wasmFactory: WasmFactory
  ) {
    super();

    const typedChainId = calculateTypedChainId(ChainType.EVM, chainId);
    this.typedChainidSubject = new BehaviorSubject<number>(typedChainId);

    this.publicClient = getPublicClient({ chainId });

    watchBlockNumber({ chainId, listen: true }, (nextBlockNumber) => {
      this._newBlock.next(nextBlockNumber);
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

  // Init web3 provider with the `Web3Accounts` as the default account provider
  static async init(
    requestConnector: SupportedConnector,
    chainId: number,
    relayerManager: Web3RelayerManager,
    noteManager: NoteManager | null,
    appConfig: ApiConfig,
    notification: NotificationHandler,
    wasmFactory: WasmFactory // A Factory Fn that wil return wasm worker that would be supplied eventually to the `sdk-core`
  ) {
    const { connector, chain } = await connect({
      chainId,
      connector: requestConnector,
    });

    if (chain.unsupported) {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }

    if (!connector) {
      throw WebbError.from(WebbErrorCodes.NoConnectorConfigured);
    }

    const walletClient = await connector.getWalletClient();

    const accounts = new Web3Accounts(walletClient);

    return new WebbWeb3Provider(
      connector as SupportedConnector, // TODO: Remove the cast
      walletClient,
      chainId,
      relayerManager,
      noteManager,
      appConfig,
      notification,
      accounts,
      wasmFactory
    );
  }

  getProvider(): WalletClient {
    return this.walletClient;
  }

  // Web3 has the evm, so the "api interface" should always be available.
  async ensureApiInterface(): Promise<boolean> {
    return Promise.resolve(true);
  }

  setChainListener() {
    return watchNetwork(({ chain }) => {
      if (!chain) {
        return;
      }

      this.emit('providerUpdate', [chain.id]);
    });
  }

  setAccountListener() {
    return watchAccount(async (account) => {
      const connector = account.connector;
      if (!connector) {
        return;
      }

      const walletClient = await connector.getWalletClient();
      const newAcc = new Web3Accounts(walletClient);
      this.emit('newAccounts', newAcc);
    });
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
      tx?: Transaction<NewNotesTxResult>;
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
            getAnchorDeploymentBlockNumber(typedChainId, anchorId)) ??
          0,
        leaves: storedLeaves || [],
      };

      console.log('Stored contract info: ', storedContractInfo);

      const leavesFromChain = await this.getDepositLeaves(
        BigInt(storedContractInfo.lastQueriedBlock + 1),
        ZERO_BIG_INT,
        getPublicClient({ chainId: +evmId.toString() }),
        vAnchorContract
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
      await storage.set(
        'lastQueriedBlock',
        +leavesFromChain.lastQueriedBlock.toString()
      );
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
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      PublicClient
    >,
    owner: Keypair
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

    const anchorId = vAnchorContract.address;

    const utxos = await this.getSpendableUtxosFromChain(
      owner,
      BigInt(getAnchorDeploymentBlockNumber(typedChainId, anchorId) || 1),
      vAnchorContract
    );

    console.log(`Found ${utxos.length} UTXOs on chain`);

    const notes = Promise.all(
      utxos.map(async (utxo) => {
        console.log(utxo.serialize());

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
          sourceIdentifyingData: anchorId,
          targetChain: utxo.chainId,
          targetIdentifyingData: anchorId,
          tokenSymbol: tokenSymbol.view.symbol,
        });

        return note;
      })
    );

    return notes;
  }

  get typedChainId(): number {
    return this.typedChainidSubject.getValue();
  }

  get capabilities(): ProvideCapabilities {
    const connector = this.connector;

    if (connector instanceof MetaMaskConnector) {
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
   */
  async getVAnchorInstance(
    address: string,
    provider: PublicClient
  ): Promise<VAnchor> {
    const maxEdges = await this.getVAnchorMaxEdges(address, provider);

    return VAnchor.connect(
      ensureHex(address),
      await this.getZkFixtures(maxEdges, true),
      await this.getZkFixtures(maxEdges, false),
      null as any // We need the logic inside this class so pass the signer as null
    );
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
    >
  ): Promise<{ lastQueriedBlock: bigint; newLeaves: Array<Hash> }> {
    const lastQueriedBlock =
      finalBlockArg || (await publicClient.getBlockNumber());

    const filter = await vAnchorContract.createEventFilter.NewCommitment({
      fromBlock: startingBlock,
      toBlock: lastQueriedBlock,
      strict: true,
    });

    const logs = await publicClient.getFilterChanges({ filter });

    return {
      lastQueriedBlock,
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
    >
  ): Promise<Array<Utxo>> {
    const chainId = await vAnchorContract.read.getChainId();

    const filter = await vAnchorContract.createEventFilter.NewCommitment({
      fromBlock: startingBlock,
      toBlock: 'latest',
      strict: true,
    });

    const logs = await getPublicClient({
      chainId: +chainId.toString(),
    }).getFilterLogs({ filter });

    const parsedLogs = logs.map((log) => ({
      encryptedOutput: log.args.encryptedOutput,
      leafIndex: log.args.leafIndex,
    }));

    const utxosWithNull = await Promise.all(
      parsedLogs.map(({ encryptedOutput, leafIndex }) =>
        this.validateAmountEncryptedOutput(owner, encryptedOutput, leafIndex)
      )
    );

    const filteredUtxos = utxosWithNull.filter(
      (utxo): utxo is Utxo => utxo !== null
    );

    const isUtxosSpent = await this.validateIsSpent(
      filteredUtxos.map((utxo) => BigInt(ensureHex(utxo.nullifier))),
      vAnchorContract
    );

    const spendableUtxos = filteredUtxos.filter(
      (_, index) => !isUtxosSpent[index]
    );

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
        index: decryptedUtxo.index?.toString() ?? leafIndex.toString(),
      });

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
    nullifiers: Array<bigint>,
    vAnchorContract: GetContractReturnType<
      typeof VAnchor__factory.abi,
      PublicClient
    >
  ): Promise<ReadonlyArray<boolean>> {
    return vAnchorContract.read.isSpentArray([nullifiers]);
  }
}
