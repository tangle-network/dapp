// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { CurrencyRole, CurrencyType } from '@webb-tools/dapp-types/Currency';
import { TypedChainId } from '@webb-tools/dapp-types/ChainId';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { u8aToHex } from '@webb-tools/utils';
import assert from 'assert';
import { PublicClient } from 'viem';
import { parsedAnchorConfig } from './anchors';
import { AnchorConfigEntry } from './anchors/anchor-config.interface';
import { getBridgeConfigByAsset } from './bridges';
import { BridgeConfigEntry } from './bridges/bridge-config.interface';
import { ChainConfig } from './chains/chain-config.interface';
import { CurrencyConfig } from './currencies/currency-config.interface';
import { EVMOnChainConfig, SubstrateOnChainConfig } from './on-chain-config';
import {
  getNativeCurrencyFromConfig,
  parseSubstrateTargetSystem,
} from './utils';
import { WalletConfig } from './wallets/wallet-config.interface';
import values from 'lodash/values';
import keys from 'lodash/keys';
import { AddressType, isAppEnvironmentType } from './types';

export type Chain = ChainConfig & {
  wallets: Array<Wallet['id']>;
};

export type Wallet = WalletConfig;

export type ApiConfigInput = {
  wallets?: Record<number, WalletConfig>;
  chains?: Record<number, ChainConfig>;
  currencies?: Record<number, CurrencyConfig>;
  bridgeByAsset?: Record<number, BridgeConfigEntry>;
  anchors?: Record<number, AnchorConfigEntry>;
  fungibleToWrappableMap?: Map<number, Map<number, Set<number>>>;
};

export class ApiConfig {
  /**
   * All supported typed chain ids set,
   * it is calculated from the anchor config
   * which is fetched from the on-chain config
   */
  readonly supportedTypedChainIds: ReadonlySet<number>;

  constructor(
    /**
     * id -> wallet config
     */
    public wallets: Record<number, WalletConfig>,
    /**
     * typed chain id -> chain config
     */
    public chains: Record<number, ChainConfig>,
    /**
     * id -> currency config
     */
    public currencies: Record<number, CurrencyConfig>,
    /**
     * fungible currency id -> bridge config entry
     */
    public bridgeByAsset: Record<number, BridgeConfigEntry>,
    /**
     * fungible currency id -> anchor config entry
     */
    public anchors: Record<number, AnchorConfigEntry>,
    /**
     * fungible currency id -> typed chain id -> wrappable currency ids
     */
    public fungibleToWrappableMap: Map<number, Map<number, Set<number>>>,
  ) {
    const typedChainIdsSet = new Set<number>();

    values(this.anchors).forEach((anchorsRecord) => {
      keys(anchorsRecord).forEach((typedChainId) => {
        typedChainIdsSet.add(+typedChainId);
      });
    });

    this.supportedTypedChainIds = typedChainIdsSet;
  }

  static init = (config: ApiConfigInput) => {
    const currencies = config.currencies ?? {};
    const anchors = config.anchors ?? {};
    const fungibleToWrappableMap = config.fungibleToWrappableMap ?? new Map();

    const bridgeByAsset = getBridgeConfigByAsset(currencies, anchors);

    return new ApiConfig(
      config.wallets ?? {},
      config.chains ?? {},
      currencies,
      bridgeByAsset,
      anchors,
      fungibleToWrappableMap,
    );
  };

  static initFromApi = async (
    config: Pick<ApiConfigInput, 'chains' | 'wallets'>,
    evmProviderFactory: (typedChainId: number) => Promise<PublicClient>,
    substrateProviderFactory: (typedChainId: number) => Promise<ApiPromise>,
  ) => {
    const evmOnChainConfig = EVMOnChainConfig.getInstance();
    const substrateOnChainConfig = SubstrateOnChainConfig.getInstance();

    const {
      currenciesConfig: onChainConfig,
      fungibleToWrappableMap: evmFungibleToWrappableMap,
      anchorConfig: evmAnchorConfig,
    } = await evmOnChainConfig.fetchCurrenciesConfig(
      parsedAnchorConfig,
      evmProviderFactory,
    );

    const {
      currenciesConfig,
      fungibleToWrappableMap: fungibleToWrappableMap,
      anchorConfig: anchors,
    } = await substrateOnChainConfig.fetchCurrenciesConfig(
      parsedAnchorConfig,
      substrateProviderFactory,
      onChainConfig,
      evmFungibleToWrappableMap,
      evmAnchorConfig,
    );

    const bridgeByAsset = getBridgeConfigByAsset(currenciesConfig, anchors);

    return new ApiConfig(
      config.wallets ?? {},
      config.chains ?? {},
      currenciesConfig,
      bridgeByAsset,
      anchors,
      fungibleToWrappableMap,
    );
  };

  getEVMChainName(evmId: number): string {
    const chain = Object.values(this.chains).find(
      (chainsConfig) => chainsConfig.id === evmId,
    );

    if (chain) {
      return chain.name;
    } else {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }
  }

  getChainNameFromTypedChainId(typedChainId: TypedChainId): string {
    const chain =
      this.chains[
        calculateTypedChainId(typedChainId.chainType, typedChainId.chainId)
      ];
    return chain.name;
  }

  getNativeCurrencySymbol(evmId: number): string {
    const currency = getNativeCurrencyFromConfig(
      this.currencies,
      calculateTypedChainId(ChainType.EVM, evmId),
    );

    return currency?.symbol ?? 'Unknown';
  }

  getCurrencyBySymbolAndTypedChainId(
    symbol: string,
    typedChainId: number,
  ): CurrencyConfig | undefined {
    return Object.values(this.currencies).find(
      (currencyCfg) =>
        currencyCfg.symbol === symbol &&
        currencyCfg.addresses.has(typedChainId),
    );
  }

  getCurrencyByAddress(rawAddress: string): CurrencyConfig | undefined {
    const address = rawAddress.toLowerCase();
    const currency = Object.keys(this.currencies).find((key) => {
      const addresses = Array.from(
        this.currencies[key as any].addresses.values(),
      ).map((address) => address.toLowerCase()) as string[];
      return addresses.includes(address);
    });
    return this.currencies[currency as any] ?? undefined;
  }

  /**
   * Get the anchor identifier of the given fungible currency id and typed chain id
   * it could be either the anchor address on evm or tree id on substrate
   * @param fungibleCurrencyId the fungible currency id of the anchor
   * @param typedChainId the typed chain id of the anchor
   * @returns either the anchor address on evm or tree id on substrate
   */
  getAnchorIdentifier(fungibleCurrencyId: number, typedChainId: number) {
    const anchor = this.anchors[fungibleCurrencyId];
    if (!anchor) {
      return undefined;
    }
    return anchor[typedChainId];
  }

  getUnavailableCurrencies(
    avaialbleCurrencies: CurrencyConfig[],
  ): CurrencyConfig[] {
    const unavailableCurrencies = Object.values(this.currencies).filter(
      (currency) => !avaialbleCurrencies.find((c) => c.id === currency.id),
    );
    return unavailableCurrencies;
  }

  getCurrenciesBy(opts: { role?: CurrencyRole; type?: CurrencyType }) {
    const currencies = Object.values(this.currencies).filter((currency) => {
      if (opts.role && currency.role !== opts.role) {
        return false;
      }
      if (opts.type && currency.type !== opts.type) {
        return false;
      }
      return true;
    });
    return currencies;
  }

  /**
   * Parse the target system then compare with the anchor identifier
   * @param anchorIdentifier the anchor identifier, either the anchor address on evm or tree id on substrate
   * @param targetSystem the target system, which is get from the resource id (it should be 26 bytes)
   * @returns true if the anchor identifier is matched with the target system
   */
  isEqTargetSystem(
    anchorIdentifier: AddressType,
    targetSystem: Uint8Array,
  ): boolean {
    assert(targetSystem.length === 26, 'target system should be 26-bytes');

    const targetSystemHex = u8aToHex(targetSystem);

    // If the anchor identifier is ethereum address, compare it directly with the target system
    if (isEthereumAddress(anchorIdentifier)) {
      // Compare using BigInt because the target hex maybe start with 0x00
      return BigInt(anchorIdentifier) === BigInt(targetSystemHex);
    }

    // Otherwise, the anchor identifier is substrate tree id,
    // parse the target system and compare the tree id
    const { treeId } = parseSubstrateTargetSystem(targetSystemHex);
    return +anchorIdentifier === treeId;
  }

  /**
   * Get all supported wallets that have at least one supported chain id
   * in the given supported typed chain ids if the typed chain id is not provided,
   * otherwise, first filter the wallets by the given typed chain id
   * @param typedChainId the typed chain id to filter the wallets
   * @param opts.filterByAnchor if true, only return the wallets that have the anchor @default true
   * @returns all supported wallets that have at least one supported chain id
   */
  getSupportedWallets(
    typedChainId?: number,
    opts = { filterByActiveAnchor: true },
  ): WalletConfig[] {
    const filterByActiveAnchor = opts.filterByActiveAnchor ?? true;

    const wallets =
      typeof typedChainId === 'number'
        ? values(this.wallets).filter((walletCfg) =>
            walletCfg.supportedChainIds.includes(typedChainId),
          )
        : values(this.wallets);

    if (!filterByActiveAnchor) {
      return wallets;
    }

    return wallets.filter((walletCfg) => {
      return walletCfg.supportedChainIds.some((typedChainId) =>
        this.supportedTypedChainIds.has(typedChainId),
      );
    });
  }

  /**
   * Get all supported chains which are populated from the anchor config
   * @param withEnv: if true, only return the chains that support the current env
   * @returns all supported chains which are populated from the anchor config
   */
  getSupportedChains(
    options: {
      /** If `true`, only return the chaisn that support the current env */
      withEnv?: boolean;
    } = {},
  ): ChainConfig[] {
    const { withEnv } = options;

    const chainCfgs = Array.from(this.supportedTypedChainIds)
      .map((typedChainId) => this.chains[typedChainId])
      .filter((chain): chain is ChainConfig => Boolean(chain));

    if (!withEnv) {
      return chainCfgs;
    }

    const currentEnv =
      process.env.NODE_ENV && isAppEnvironmentType(process.env.NODE_ENV)
        ? process.env.NODE_ENV
        : 'development';

    return chainCfgs.filter((chain) => {
      // If the chain has no env, it means it is supported in all envs
      if (!chain.env) {
        return true;
      }

      return chain.env.includes(currentEnv);
    });
  }
}
