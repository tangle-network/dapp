import { ChainId } from '@webb-dapp/apps/configs';
import {
  Capabilities,
  RelayedChainConfig,
  RelayerConfig,
  RelayerMessage,
} from '@webb-dapp/react-environment/webb-context/relayer/types';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

type RelayerQuery = {
  baseOn?: 'evm' | 'substrate';
  ipService?: true;
  chainId?: ChainId;
};
type RelayedChainInput = {
  endpoint: string;
  name: string;
  contractAddress: string;
  baseOn: 'evm' | 'substrate';
};

export type WithdrawRelayerArgs = {
  root: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: string;
  refund: string;
};

export interface RelayerInfo {
  substrate: Record<string, RelayedChainConfig | null>;
  evm: Record<string, RelayedChainConfig | null>;
}

export type ChainNameIntoChainId = (name: string, basedOn: 'evm' | 'substrate') => ChainId | null;

/**
 *  Webb relayers manger
 *  this will fetch/mange/provide this relayers and there capabilities
 *
 * */
export class WebbRelayerBuilder {
  /// storage for relayers capabilities
  private capabilities: Record<RelayerConfig['endpoint'], Capabilities> = {};

  private constructor(private config: RelayerConfig[], private readonly chainNameAdapter: ChainNameIntoChainId) {}

  /// Mapping the fetched relayers info to the Capabilities store
  private static infoIntoCapabilities(
    _nfig: RelayerConfig,
    info: RelayerInfo,
    nameAdapter: ChainNameIntoChainId
  ): Capabilities {
    console.log({ info });
    return {
      hasIpService: true,
      supportedChains: {
        evm: Object.keys(info.evm)
          .filter((key) => info.evm[key]?.account && Boolean(nameAdapter(key, 'evm')))
          .reduce((m, key) => {
            m.set(nameAdapter(key, 'evm'), info.evm[key]);
            return m;
          }, new Map()),
        substrate: Object.keys(info.substrate)
          .filter((key) => info.substrate[key]?.account && Boolean(nameAdapter(key, 'substrate')))
          .reduce((m, key) => {
            m.set(nameAdapter(key, 'substrate'), info.evm[key]);
            return m;
          }, new Map()),
      },
    };
  }

  /// fetch relayers
  private async fetchInfo(config: RelayerConfig) {
    const res = await fetch(`${config.endpoint}/api/v1/info`);
    console.log("fetchedInfo", config.endpoint);
    const info: RelayerInfo = await res.json();
    const capabilities = WebbRelayerBuilder.infoIntoCapabilities(config, info, this.chainNameAdapter);
    this.capabilities[config.endpoint] = capabilities;
    return capabilities;
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
          relayerBuilder.fetchInfo(p),
          new Promise((res) => {
            setTimeout(res.bind(null, null), 5000);
          }),
        ]);
      })
    );

    return relayerBuilder;
  }

  /*
   *  get a list of the suitable relaryes for a given query
   * */
  getRelayer(query: RelayerQuery): WebbRelayer[] {
    const { baseOn, chainId, ipService } = query;
    console.log("here", Object.keys(this.capabilities));
    return Object.keys(this.capabilities)
      .filter((key) => {
        const capabilities = this.capabilities[key];
        if (ipService) {
          if (!capabilities.hasIpService) {
            return false;
          }
        }
        if (baseOn && chainId) {
          return Boolean(capabilities.supportedChains[baseOn].get(chainId));
        }
        if (baseOn && !chainId) {
          return capabilities.supportedChains[baseOn].size > 0;
        }
        return true;
      })
      .map((key) => {
        return new WebbRelayer(key, this.capabilities[key]);
      });
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

class RelayedWithdraw {
  /// status of the withdraw
  private status: RelayedWithdrawResult = RelayedWithdrawResult.PreFlight;
  /// watch for the current withdraw status
  readonly watcher: Observable<[RelayedWithdrawResult, string | undefined]>;
  private emitter: Subject<[RelayedWithdrawResult, string | undefined]> = new Subject();

  constructor(private ws: WebSocket) {
    this.watcher = this.emitter.asObservable();

    ws.onmessage = ({ data }) => {
      console.log(data);
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
      return [RelayedWithdrawResult.Errored, 'Invalided relayer address'];
    } else if (data.withdraw?.finalized) {
      return [RelayedWithdrawResult.CleanExit, data.withdraw.finalized.txHash];
    } else {
      return [RelayedWithdrawResult.Continue, undefined];
    }
  };

  generateWithdrawRequest(chain: RelayedChainInput, proof: string, args: WithdrawRelayerArgs) {
    return {
      [chain.baseOn]: {
        [chain.name]: {
          relayWithdraw: {
            contract: chain.contractAddress,
            proof,
            ...args,
          },
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

  async initWithdraw() {
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
    return new RelayedWithdraw(ws);
  }

  async getIp(): Promise<string> {
    const req = await fetch(`${this.endpoint}/api/v1/ip`);
    if (req.ok) {
      return req.json();
    } else {
      throw new Error('network error');
    }
  }

  static intoActiveWebRelayer(
    instance: WebbRelayer,
    query: { chain: ChainId; basedOn: 'evm' | 'substrate' },
    getFees: (note: string, withdrawFeePercentage: number) => Promise<string>
  ): ActiveWebbRelayer {
    return new ActiveWebbRelayer(instance.endpoint, instance.capabilities, query, getFees);
  }
}

export class ActiveWebbRelayer extends WebbRelayer {
  constructor(
    endpoint: string,
    capabilities: Capabilities,
    private query: { chain: ChainId; basedOn: 'evm' | 'substrate' },
    private getFees: (note: string, withdrawFeePercentage: number) => Promise<string>
  ) {
    super(endpoint, capabilities);
  }

  private get config() {
    const list = this.capabilities.supportedChains[this.query.basedOn];
    return list.get(this.query.chain);
  }

  get fee(): number | undefined {
    return this.config?.withdrawFeePercentage;
  }

  get gasLimit(): number | undefined {
    return undefined;
  }

  get account(): string | undefined {
    return this.config?.account;
  }
  fees = async (note: string) => {
    console.log(this.config?.withdrawFeePercentage, this.config);
    return this.getFees(note, this.config?.withdrawFeePercentage ?? 0);
  };
}
