// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import type {
  Capabilities,
  ChainNameIntoChainId,
  RelayedChainConfig,
  RelayerInfo,
} from '@webb-tools/abstract-api-provider/relayer/index.js';
import { WebbRelayer } from '@webb-tools/abstract-api-provider/relayer/index.js';
import { LoggerService } from '@webb-tools/browser-utils';
import {
  type RelayerCMDBase,
  type RelayerConfig,
  chainNameAdapter,
  relayerConfig,
} from '@webb-tools/dapp-config/relayer-config.js';
import { isAppEnvironmentType } from '@webb-tools/dapp-config/types.js';
import { PolkadotRelayerManager } from '@webb-tools/polkadot-api-provider';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { Web3RelayerManager } from '@webb-tools/web3-api-provider';

let relayerManagerFactory: WebbRelayerManagerFactory | null = null;

export async function getRelayerManagerFactory(options?: {
  /**
   * If true, the relayer info will be fetched lazily
   */
  isLazyFetch?: boolean;
}) {
  const env = process.env.NODE_ENV ?? '';

  const appEnv = isAppEnvironmentType(env) ? env : 'development'; // Fallback to `development`

  // Filter out the relayers which are not enabled for the current environment
  const filteredRelayerConfigs = relayerConfig.filter((relayer) =>
    relayer.env ? relayer.env.includes(appEnv) : true
  );

  if (!relayerManagerFactory) {
    relayerManagerFactory = await WebbRelayerManagerFactory.init(
      filteredRelayerConfigs,
      chainNameAdapter,
      options?.isLazyFetch
    );
  }

  return relayerManagerFactory;
}

/**
 * The WebbRelayerManagerFactory will initiate communication with relayers,
 * Then vend instances of RelayerManagers for use by webb-providers
 *
 * @param capabilities - storage for relayers capabilities
 * @param relayerConfigs - The whole relayers configuration of the project
 * @param chainNameAdapter - An adapter for getting the typedChainId from the chain name and the base
 **/
export class WebbRelayerManagerFactory {
  private logger = LoggerService.get('RelayerManagerFactory');

  private capabilities: Record<RelayerConfig['endpoint'], Capabilities> = {};

  private constructor(
    protected relayerConfigs: RelayerConfig[],
    private readonly chainNameAdapter: ChainNameIntoChainId
  ) {}

  /**
   * Mapping the fetched relayers info to the Capabilities store
   **/
  private static infoIntoCapabilities(
    info: RelayerInfo,
    nameAdapter: ChainNameIntoChainId
  ): Capabilities {
    const evmMap = new Map<number, RelayedChainConfig<'evm'>>();
    const substrateMap = new Map<number, RelayedChainConfig<'substrate'>>();

    return {
      hasIpService: true,
      features: info.features,
      supportedChains: {
        evm: info.evm
          ? Object.keys(info.evm)
              .filter(
                (key) =>
                  info.evm[key]?.beneficiary && nameAdapter(key, 'evm') != null
              )
              .reduce((m, key) => {
                const cap = info.evm[key];
                if (!cap) return m;

                m.set(nameAdapter(key, 'evm'), cap);

                return m;
              }, evmMap)
          : evmMap,
        substrate: info.substrate
          ? Object.keys(info.substrate)
              .filter(
                (key) =>
                  info.substrate[key]?.beneficiary &&
                  info.substrate[key]?.enabled
              )
              .reduce((m, key) => {
                const typedChainId = calculateTypedChainId(
                  ChainType.Substrate,
                  +key
                );
                const cap = info.substrate[key];
                if (!cap) {
                  return m;
                }

                m.set(typedChainId, cap);

                return m;
              }, substrateMap)
          : substrateMap,
      },
    };
  }

  /// fetch relayers
  private async fetchCapabilitiesAndInsert(config: RelayerConfig) {
    const cap = await this.fetchCapabilities(config.endpoint);

    if (!cap) {
      return this.capabilities;
    }

    this.capabilities[config.endpoint] = cap;

    return this.capabilities;
  }

  public async fetchCapabilities(
    endpoint: string
  ): Promise<Capabilities | null> {
    try {
      const response = await fetch(`${endpoint}/api/v1/info`);
      const info: RelayerInfo = await response.json();
      this.logger.info('Received relayer info from endpoint: ', endpoint, info);
      const capabilities = WebbRelayerManagerFactory.infoIntoCapabilities(
        info,
        this.chainNameAdapter
      );
      return capabilities;
    } catch (error) {
      console.error('Error fetching relayer info: ', error);
    }

    return null;
  }

  // Examine the data for saved (already fetched) capabilities. For easier
  // fetching of information (i.e. fee, beneficiary) and passing as props.
  public readCapabilities(endpoint: string): Capabilities | null {
    return this.capabilities[endpoint];
  }

  // This function will add the relayer to the factory's store of capabilities.
  // When new RelayerManagers are created, any added entries will be passed.
  public async addRelayer(endpoint: string) {
    const c = await this.fetchCapabilitiesAndInsert({ endpoint });

    return c;
  }

  /**
   * init the builder create new instance and fetch the relayers
   * @param config - The relayers configuration
   * @param chainNameAdapter - An adapter for getting the typedChainId from the chain name and the base
   * @param isLazyFetch - If true, the relayer info will be fetched lazily
   *
   * @returns - The WebbRelayerManagerFactory instance
   **/
  static async init(
    config: RelayerConfig[],
    chainNameAdapter: ChainNameIntoChainId,
    isLazyFetch?: boolean
  ): Promise<WebbRelayerManagerFactory> {
    const relayerManagerFactory = new WebbRelayerManagerFactory(
      config,
      chainNameAdapter
    );

    // For all relayers in the relayerConfigs, fetch the info - but timeout after 5 seconds
    // This is done to prevent issues with relayers which are not operating properly
    if (!isLazyFetch) {
      await Promise.allSettled(
        config.map((p) => {
          return Promise.race([
            relayerManagerFactory.fetchCapabilitiesAndInsert(p),
            new Promise((resolve) => {
              setTimeout(resolve.bind(null, null), 5000);
            }),
          ]);
        })
      );
    }

    return relayerManagerFactory;
  }

  async getRelayerManager<CMDBase extends RelayerCMDBase>(
    type: CMDBase
  ): Promise<
    CMDBase extends 'evm' ? Web3RelayerManager : PolkadotRelayerManager
  > {
    const relayers = Object.keys(this.capabilities).map((endpoint) => {
      return new WebbRelayer(endpoint, this.capabilities[endpoint]);
    });

    switch (type) {
      case 'substrate':
        return new PolkadotRelayerManager(relayers) as any;
      default:
        return new Web3RelayerManager(relayers) as any;
    }
  }
}
