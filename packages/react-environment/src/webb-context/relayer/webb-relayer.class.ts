import { Capabilities, Relayerconfig } from '@webb-dapp/react-environment/webb-context/relayer/types';
import { ChainId } from '@webb-dapp/apps/configs';

type RelayerQuery = {
  baseOn?: 'evm' | 'substrate';
  ipService?: true;
  chainId?: ChainId;
};

export class WebbRelayerBuilder {
  private capabilities: Record<Relayerconfig['address'], Capabilities> = {};

  private constructor(private config: Relayerconfig[]) {}

  private static infoIntoCapabilities(info: any): Capabilities {
    return {} as any;
  }

  private async fetchInfo(config: Relayerconfig) {
    const res = await fetch(`${config.address}/api/v1/info`);
    const info = await res.json();
    const capabilities = WebbRelayerBuilder.infoIntoCapabilities(info);
    this.capabilities[config.address] = capabilities;
    return capabilities;
  }

  async initBuilder(config: Relayerconfig[]): Promise<WebbRelayerBuilder> {
    const relayerBuilder = new WebbRelayerBuilder(config);
    await Promise.all(config.map(this.fetchInfo, this));
    return relayerBuilder;
  }

  getRelayer(query: RelayerQuery): WebbRelayer[] {
    const { baseOn, ipService, chainId } = query;
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

export class WebbRelayer {
  private _ready = false;
  private _ws: WebSocket | null = null;

  constructor(readonly address: string, readonly capabilities: Capabilities) {}

  async init() {
    if (this._ready) {
      throw new Error('Already initialized');
    }
    const ws = new WebSocket(this.address);
    await new Promise((r, c) => {
      ws.onopen = r;
      ws.onerror = r;
    });
    this._ws = ws;
    this._ready = true;
  }

  private get ws() {
    if (!this._ws) {
      throw new Error('Relater Not ready yet');
    }
  }

  get isReady() {
    return this._ready;
  }
}
