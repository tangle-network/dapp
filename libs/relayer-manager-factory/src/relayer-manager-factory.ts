// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import {
  Capabilities,
  ChainNameIntoChainId,
  RelayerInfo,
  WebbRelayer,
  WebbRelayerManager,
} from '@webb-tools/abstract-api-provider/relayer';
import { LoggerService } from '@webb-tools/browser-utils';
import {
  RelayerCMDBase,
  RelayerConfig,
  chainNameAdapter,
  relayerConfig,
} from '@webb-tools/dapp-config/relayer-config';
import { PolkadotRelayerManager } from '@webb-tools/polkadot-api-provider';
import { Web3RelayerManager } from '@webb-tools/web3-api-provider';

let relayerManagerFactory: WebbRelayerManagerFactory | null = null;

export async function getRelayerManagerFactory() {
  if (!relayerManagerFactory) {
    relayerManagerFactory = await WebbRelayerManagerFactory.init(
      relayerConfig,
      chainNameAdapter
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
    return {
      hasIpService: true,
      supportedChains: {
        evm: info.evm
          ? Object.keys(info.evm)
              .filter(
                (key) =>
                  info.evm[key]?.beneficiary && nameAdapter(key, 'evm') != null
              )
              .reduce((m, key) => {
                m.set(nameAdapter(key, 'evm'), info.evm[key]);

                return m;
              }, new Map())
          : new Map(),
        substrate: info.substrate
          ? Object.keys(info.substrate)
              .filter(
                (key) =>
                  info.substrate[key]?.beneficiary &&
                  nameAdapter(key, 'substrate') != null
              )
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
    this.capabilities[config.endpoint] = await this.fetchCapabilities(
      config.endpoint
    );
    return this.capabilities;
  }

  public async fetchCapabilities(endpoint: string): Promise<Capabilities> {
    try {
      const response = await fetch(`${endpoint}/api/v1/info`);
      const info: RelayerInfo = await response.json();
      this.logger.info('Received relayer info from endpoint: ', endpoint, info);
      return WebbRelayerManagerFactory.infoIntoCapabilities(
        info,
        this.chainNameAdapter
      );
    } catch (error) {
      // Ignore errors and clear the network errors
    }
  }

  // Examine the data for saved (already fetched) capabilities. For easier
  // fetching of information (i.e. fees, beneficiary) and passing as props.
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
   * init the builder
   *  create new instance and fetch the relayers
   **/
  static async init(
    config: RelayerConfig[],
    chainNameAdapter: ChainNameIntoChainId
  ): Promise<WebbRelayerManagerFactory> {
    const relayerManagerFactory = new WebbRelayerManagerFactory(
      config,
      chainNameAdapter
    );

    // For all relayers in the relayerConfigs, fetch the info - but timeout after 5 seconds
    // This is done to prevent issues with relayers which are not operating properly
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

    return relayerManagerFactory;
  }

  async getRelayerManager(type: RelayerCMDBase): Promise<WebbRelayerManager> {
    const relayers = Object.keys(this.capabilities).map((endpoint) => {
      return new WebbRelayer(endpoint, this.capabilities[endpoint]);
    });

    switch (type) {
      case 'evm':
        return new Web3RelayerManager(relayers);
      case 'substrate':
        return new PolkadotRelayerManager(relayers);
    }
  }
}
