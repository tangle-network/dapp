import { ChainId } from '@webb-dapp/apps/configs';
import {
  Capabilities,
  RealyedChainConfig,
  Relayerconfig,
} from '@webb-dapp/react-environment/webb-context/relayer/types';
import { Observable, Subject } from 'rxjs';

type RelayerQuery = {
  baseOn?: 'evm' | 'substrate';
  ipService?: true;
  chainId?: ChainId;
};
type RelayedChainInput = {
  endpoint: string;
  k;
  name: string;
  contractAddress: string;
  baseOn: 'evm' | 'substrate';
};

export type WitdrawRealyerArgs = {
  root: string;
  nullifierHash: string;
  recipient: string;
  relayer: string;
  fee: string;
  refund: string;
};

export interface RelayerInfo {
  substrate: Record<string, RealyedChainConfig | null>;
  evm: Record<string, RealyedChainConfig | null>;
}

export type ChainNameIntoChainId = (name: string, basedOn: 'evm' | 'substrate') => ChainId | null;

/**
 *  Webb relayers manger
 *  this will fetch/mange/provide this relayers and there capabilities
 *
 * */
export class WebbRelayerBuilder {
  /// storage for relayers capabilities
  private capabilities: Record<Relayerconfig['address'], Capabilities> = {};

  private constructor(private config: Relayerconfig[], private readonly chainNameAdapter: ChainNameIntoChainId) {}

  /// Mapping the fetched relayers info to the Capabilities store
  private static infoIntoCapabilities(
    _nfig: Relayerconfig,
    info: RelayerInfo,
    nameAdapter: ChainNameIntoChainId
  ): Capabilities {
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
  private async fetchInfo(config: Relayerconfig) {
    const res = await fetch(`${config.address}/api/v1/info`);
    const info: RelayerInfo = await res.json();
    const capabilities = WebbRelayerBuilder.infoIntoCapabilities(config, info, this.chainNameAdapter);
    this.capabilities[config.address] = capabilities;
    return capabilities;
  }

  /**
   * init the builder
   *  create new instance and fetch the relayres
   * */
  static async initBuilder(
    config: Relayerconfig[],
    chainNameAdapter: ChainNameIntoChainId
  ): Promise<WebbRelayerBuilder> {
    const relayerBuilder = new WebbRelayerBuilder(config, chainNameAdapter);
    await Promise.all(config.map(relayerBuilder.fetchInfo, relayerBuilder));
    return relayerBuilder;
  }

  /*
   *  get a list of the suitable relaryes for a given query
   * */
  getRelayer(query: RelayerQuery): WebbRelayer[] {
    const { baseOn, chainId, ipService } = query;
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
  readonly watcher: Observable<RelayedWithdrawResult>;
  private emitter: Subject<RelayedWithdrawResult> = new Subject();

  constructor(private ws: WebSocket) {
    this.watcher = this.emitter.asObservable();

    ws.onmessage = ({ data }) => {
      this.status = this.handleMessage(data);
      this.emitter.next(this.status);
      if (this.status === RelayedWithdrawResult.CleanExit) {
        this.emitter.complete();
        this.ws.close();
      }
    };
    ws.onerror = (e) => {
      console.log(e);
    };
  }

  private handleMessage(data: any): RelayedWithdrawResult {
    if (data.error || data.withdraw?.errored) {
      return RelayedWithdrawResult.Errored;
    } else if (data.withdraw?.finlized) {
      return RelayedWithdrawResult.CleanExit;
    } else {
      return RelayedWithdrawResult.Continue;
    }
  }

  generateWithdrawRequest(chain: RelayedChainInput, proof: string, args: WitdrawRealyerArgs) {
    return {
      [chain.baseOn]: {
        [chain.name]: {
          relayWithdrew: {
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

  get currentStatus() {
    return this.status;
  }
}

export class WebbRelayer {
  constructor(readonly address: string, readonly capabilities: Capabilities) {}

  async initWithdraw() {
    const ws = new WebSocket(this.address);
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
}
