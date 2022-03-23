import {
  chainsConfig,
  getAnchorAddressForBridge,
  InternalChainId,
  webbCurrencyIdFromString,
} from '@webb-dapp/apps/configs';
import { EvmChainMixersInfo } from '@webb-dapp/react-environment/api-providers/web3/EvmChainMixersInfo';
import {
  Capabilities,
  EVMCMDKeys,
  RelayedChainConfig,
  RelayerCMDBase,
  RelayerCMDKey,
  RelayerConfig,
  RelayerEVMCommands,
  RelayerMessage,
  RelayerSubstrateCommands,
  SubstrateCMDKeys,
} from '@webb-dapp/react-environment/webb-context/relayer/types';
import { LoggerService } from '@drewstone/app-util';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

const logger = LoggerService.get('webb-relayer class');

const shuffleRelayers = (arr: WebbRelayer[]): WebbRelayer[] => {
  let currentIndex = arr.length;
  let randomIndex = 0;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }

  return arr;
};

type MixerQuery = {
  amount: number;
  tokenSymbol: string;
};

type RelayerQuery = {
  baseOn?: 'evm' | 'substrate';
  ipService?: true;
  chainId?: InternalChainId;
  contractAddress?: string;
  tornadoSupport?: MixerQuery;
  bridgeSupport?: MixerQuery;
};

export type RelayedChainInput = {
  endpoint: string;
  name: string;
  baseOn: RelayerCMDBase;
  // TODO: change to just contract
  contractAddress: string;
};
type TornadoRelayerWithdrawArgs = {
  root: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: string;
  refund: string;
};
type BridgeRelayerWithdrawArgs = {
  roots: number[];
  refreshCommitment: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: string;
  refund: string;
};
export type ContractBase = 'tornado' | 'anchor';
type CMDSwitcher<T extends RelayerCMDBase> = T extends 'evm' ? EVMCMDKeys : SubstrateCMDKeys;

export type RelayerCMDs<A extends RelayerCMDBase, C extends CMDSwitcher<A>> = A extends 'evm'
  ? C extends keyof RelayerEVMCommands
    ? RelayerEVMCommands[C]
    : never
  : C extends keyof RelayerSubstrateCommands
  ? RelayerSubstrateCommands[C]
  : never;

export type WithdrawRelayerArgs<A extends RelayerCMDBase, C extends CMDSwitcher<A>> = Omit<
  RelayerCMDs<A, C>,
  keyof RelayedChainInput | 'proof'
>;
export interface RelayerInfo {
  substrate: Record<string, RelayedChainConfig | null>;
  evm: Record<string, RelayedChainConfig | null>;
}

export type ChainNameIntoChainId = (name: string, basedOn: 'evm' | 'substrate') => InternalChainId | null;

/**
 *  Webb relayers manager
 *  this will fetch/mange/provide this relayers and there capabilities
 *
 * */
export class WebbRelayerBuilder {
  /// storage for relayers capabilities
  private capabilities: Record<RelayerConfig['endpoint'], Capabilities> = {};
  private _listUpdated = new Subject<void>();
  public readonly listUpdated: Observable<void>;

  private constructor(private config: RelayerConfig[], private readonly chainNameAdapter: ChainNameIntoChainId) {
    this.listUpdated = this._listUpdated.asObservable();
  }

  /// Mapping the fetched relayers info to the Capabilities store
  private static infoIntoCapabilities(
    _nfig: RelayerConfig,
    info: RelayerInfo,
    nameAdapter: ChainNameIntoChainId
  ): Capabilities {
    console.log('received info: ', info);

    return {
      hasIpService: true,
      supportedChains: {
        evm: info.evm
          ? Object.keys(info.evm)
              .filter(
                /**
                 * account is deprecated but it's kept here for backward compatibility
                 * */
                (key) => (info.evm[key]?.account || info.evm[key]?.beneficiary) && nameAdapter(key, 'evm') != null
              )
              .reduce((m, key) => {
                m.set(nameAdapter(key, 'evm'), info.evm[key]);
                return m;
              }, new Map())
          : new Map(),
        substrate: info.substrate
          ? Object.keys(info.substrate)
              .filter((key) => info.substrate[key]?.beneficiary && nameAdapter(key, 'substrate') != null)
              .reduce((m, key) => {
                m.set(nameAdapter(key, 'substrate'), info.substrate[key]);
                return m;
              }, new Map())
          : new Map(),
      },
    };
  }

  /// fetch relayers
  private async fetchCapabilitiesAndInsert(config: RelayerConfig) {
    this.capabilities[config.endpoint] = await this.fetchCapabilities(config.endpoint);
    return this.capabilities;
  }

  public async fetchCapabilities(endpoint: string): Promise<Capabilities> {
    const res = await fetch(`${endpoint}/api/v1/info`);
    const info: RelayerInfo = await res.json();
    return WebbRelayerBuilder.infoIntoCapabilities(
      {
        endpoint,
      },
      info,
      this.chainNameAdapter
    );
  }

  public async addRelayer(endpoint: string) {
    const c = await this.fetchCapabilitiesAndInsert({ endpoint });
    this._listUpdated.next();
    return c;
  }

  /**
   * init the builder
   *  create new instance and fetch the relayers
   * */
  static async initBuilder(
    config: RelayerConfig[],
    chainNameAdapter: ChainNameIntoChainId
  ): Promise<WebbRelayerBuilder> {
    const relayerBuilder = new WebbRelayerBuilder(config, chainNameAdapter);

    // For all relayers in the config, fetch the info - but timeout after 5 seconds
    // This is done to prevent issues with relayers which are not operating properly
    await Promise.allSettled(
      config.map((p) => {
        return Promise.race([
          relayerBuilder.fetchCapabilitiesAndInsert(p),
          new Promise((res) => {
            setTimeout(res.bind(null, null), 5000);
          }),
        ]);
      })
    );
    console.log(relayerBuilder);
    return relayerBuilder;
  }

  /*
   *  get a list of the suitable relaryes for a given query
   *  the list is randomized
   * */
  getRelayer(query: RelayerQuery): WebbRelayer[] {
    const { baseOn, bridgeSupport, chainId, contractAddress, ipService, tornadoSupport } = query;
    const relayers = Object.keys(this.capabilities)
      .filter((key) => {
        const capabilities = this.capabilities[key];
        if (ipService) {
          if (!capabilities.hasIpService) {
            return false;
          }
        }
        if (contractAddress && baseOn && chainId) {
          if (baseOn == 'evm') {
            return Boolean(
              capabilities.supportedChains[baseOn]
                .get(chainId)
                ?.contracts?.find(
                  (contract) =>
                    contract.address == contractAddress.toLowerCase() && contract.eventsWatcher.enabled == true
                )
            );
          }
        }
        if (tornadoSupport && baseOn && chainId) {
          if (baseOn == 'evm') {
            const evmId = chainsConfig[chainId].chainId!;
            const mixersInfoForChain = new EvmChainMixersInfo(evmId);
            const mixerInfo = mixersInfoForChain.getTornMixerInfoBySize(
              tornadoSupport.amount,
              tornadoSupport.tokenSymbol
            );
            if (mixerInfo) {
              return Boolean(
                capabilities.supportedChains[baseOn]
                  .get(chainId)
                  ?.contracts?.find(
                    (contract) =>
                      contract.address == mixerInfo.address.toLowerCase() && contract.eventsWatcher.enabled == true
                  )
              );
            } else {
              return false;
            }
          }
        }
        if (bridgeSupport && baseOn && chainId) {
          if (baseOn == 'evm') {
            const bridgeAddress = getAnchorAddressForBridge(
              webbCurrencyIdFromString(bridgeSupport.tokenSymbol),
              chainId,
              bridgeSupport.amount
            );
            if (bridgeAddress) {
              return Boolean(
                capabilities.supportedChains[baseOn]
                  .get(chainId)
                  ?.contracts?.find(
                    (contract) =>
                      contract.address == bridgeAddress.toLowerCase() && contract.eventsWatcher.enabled == true
                  )
              );
            } else {
              return false;
            }
          }
        }
        if (baseOn && chainId) {
          return Boolean(capabilities.supportedChains[baseOn].get(chainId));
        }
        if (baseOn && !chainId) {
          console.log(capabilities.supportedChains, baseOn);
          return capabilities.supportedChains[baseOn].size > 0;
        }
        return true;
      })
      .map((key) => {
        return new WebbRelayer(key, this.capabilities[key]);
      });
    shuffleRelayers(relayers);
    return relayers;
  }
}

export enum RelayedWithdrawResult {
  /// the withdraw hasnt yet started
  PreFlight,
  /// the withdraw has been submitted to the relayers and no response yet
  OnFlight,
  // the withdraw is being processed
  Continue,
  /// the withdraw is done with success
  CleanExit,
  /// failed to create the withdraw
  Errored,
}

type RelayerLeaves = {
  leaves: string[];
  lastQueriedBlock: number;
};

class RelayedWithdraw {
  /// status of the withdraw
  private status: RelayedWithdrawResult = RelayedWithdrawResult.PreFlight;
  /// watch for the current withdraw status
  readonly watcher: Observable<[RelayedWithdrawResult, string | undefined]>;
  private emitter: Subject<[RelayedWithdrawResult, string | undefined]> = new Subject();

  constructor(private ws: WebSocket, private prefix: RelayerCMDKey) {
    this.watcher = this.emitter.asObservable();

    ws.onmessage = ({ data }) => {
      const handledMessage = this.handleMessage(JSON.parse(data));
      this.status = handledMessage[0];
      this.emitter.next(handledMessage);
      if (this.status === RelayedWithdrawResult.CleanExit) {
        this.emitter.complete();
        this.ws.close();
      }
    };
    ws.onerror = (e) => {
      console.log(e);
    };
  }

  private handleMessage = (data: RelayerMessage): [RelayedWithdrawResult, string | undefined] => {
    if (data.error || data.withdraw?.errored) {
      return [RelayedWithdrawResult.Errored, data.error || data.withdraw?.errored?.reason];
    } else if (data.network === 'invalidRelayerAddress') {
      return [RelayedWithdrawResult.Errored, 'Invalid relayer address'];
    } else if (data.withdraw?.finalized) {
      return [RelayedWithdrawResult.CleanExit, data.withdraw.finalized.txHash];
    } else {
      return [RelayedWithdrawResult.Continue, undefined];
    }
  };

  generateWithdrawRequest<T extends RelayedChainInput, C extends CMDSwitcher<T['baseOn']>>(
    chain: T,
    proof: RelayerCMDs<T['baseOn'], C>['proof'],
    args: WithdrawRelayerArgs<T['baseOn'], C>
  ) {
    return {
      [chain.baseOn]: {
        [this.prefix]: {
          contract: chain.contractAddress,
          proof,
          ...args,
        },
      },
    };
  }

  send(withdrawRequest: any) {
    if (this.status !== RelayedWithdrawResult.PreFlight) {
      throw Error('there is a withdraw process running');
    }
    this.status = RelayedWithdrawResult.OnFlight;
    this.ws.send(JSON.stringify(withdrawRequest));
  }

  await() {
    return this.watcher
      .pipe(
        filter(([next]) => {
          return next === RelayedWithdrawResult.CleanExit || next === RelayedWithdrawResult.Errored;
        })
      )
      .toPromise();
  }

  get currentStatus() {
    return this.status;
  }
}

export class WebbRelayer {
  constructor(readonly endpoint: string, readonly capabilities: Capabilities) {}

  async initWithdraw<Target extends RelayerCMDKey>(target: Target) {
    const ws = new WebSocket(this.endpoint.replace('http', 'ws') + '/ws');
    await new Promise((r, c) => {
      ws.onopen = r;
      ws.onerror = r;
    });
    /// insure the socket is open
    /// maybe removed soon
    for (;;) {
      if (ws.readyState === 1) {
        break;
      }
      await new Promise((r) => {
        setTimeout(r, 300);
      });
    }
    return new RelayedWithdraw(ws, target);
  }

  async getIp(): Promise<string> {
    const req = await fetch(`${this.endpoint}/api/v1/ip`);
    if (req.ok) {
      return req.json();
    } else {
      throw new Error('network error');
    }
  }

  // chainId should be formatted as a hex string
  async getLeaves(chainId: string, contractAddress: string): Promise<RelayerLeaves> {
    const url = `${this.endpoint}/api/v1/leaves/${chainId}/${contractAddress}`;
    logger.info(`fetching info from: ${url}`);
    const req = await fetch(url);
    if (req.ok) {
      const jsonResponse = await req.json();
      const fetchedLeaves: string[] = jsonResponse.leaves;
      const lastQueriedBlock: string = jsonResponse.lastQueriedBlock;
      const lastQueriedBlockNumber: number = parseInt(lastQueriedBlock, 16);
      logger.info(`info fetched from relayer: ${fetchedLeaves} + ${lastQueriedBlockNumber}`);
      return {
        leaves: fetchedLeaves,
        lastQueriedBlock: lastQueriedBlockNumber,
      };
    } else {
      throw new Error('network error');
    }
  }

  static intoActiveWebRelayer(
    instance: WebbRelayer,
    query: { chain: InternalChainId; basedOn: 'evm' | 'substrate' },
    getFees: (note: string) => Promise<{ totalFees: string; withdrawFeePercentage: number } | undefined>
  ): ActiveWebbRelayer {
    return new ActiveWebbRelayer(instance.endpoint, instance.capabilities, query, getFees);
  }
}

export class ActiveWebbRelayer extends WebbRelayer {
  constructor(
    endpoint: string,
    capabilities: Capabilities,
    private query: { chain: InternalChainId; basedOn: 'evm' | 'substrate' },
    private getFees: (note: string) => Promise<{ totalFees: string; withdrawFeePercentage: number } | undefined>
  ) {
    super(endpoint, capabilities);
  }

  private get config() {
    const list = this.capabilities.supportedChains[this.query.basedOn];
    return list.get(this.query.chain);
  }

  get gasLimit(): number | undefined {
    return undefined;
  }

  get account(): string | undefined {
    return this.config?.account;
  }

  get beneficiary(): string | undefined {
    return this.config?.beneficiary;
  }

  fees = async (note: string) => {
    return this.getFees(note);
  };
}
