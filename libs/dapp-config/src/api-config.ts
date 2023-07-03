// Copyright 2023 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { ApiPromise } from '@polkadot/api';
import { CurrencyRole, CurrencyType } from '@webb-tools/dapp-types';
import { TypedChainId } from '@webb-tools/dapp-types/ChainId';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import {
  ChainType,
  calculateTypedChainId,
} from '@webb-tools/sdk-core/typed-chain-id';
import { PublicClient } from 'viem';
import { parsedAnchorConfig } from './anchors';
import { AnchorConfigEntry } from './anchors/anchor-config.interface';
import { getBridgeConfigByAsset } from './bridges';
import { BridgeConfigEntry } from './bridges/bridge-config.interface';
import { ChainConfig } from './chains/chain-config.interface';
import { CurrencyConfig } from './currencies/currency-config.interface';
import { EVMOnChainConfig, SubstrateOnChainConfig } from './on-chain-config';
import { getNativeCurrencyFromConfig } from './utils';
import { WalletConfig } from './wallets/wallet-config.interface';

export type Chain = ChainConfig & {
  wallets: Record<number, Wallet>;
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
  constructor(
    public wallets: Record<number, WalletConfig>,
    public chains: Record<number, ChainConfig>,
    public currencies: Record<number, CurrencyConfig>,
    public bridgeByAsset: Record<number, BridgeConfigEntry>,
    public anchors: Record<number, AnchorConfigEntry>,
    // fungible currency id -> typed chain id -> wrappable currency ids
    public fungibleToWrappableMap: Map<number, Map<number, Set<number>>>
  ) {}

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
      fungibleToWrappableMap
    );
  };

  static initFromApi = async (
    config: Pick<ApiConfigInput, 'chains' | 'wallets'>,
    evmProviderFactory: (typedChainId: number) => Promise<PublicClient>,
    substrateProviderFactory: (typedChainId: number) => Promise<ApiPromise>
  ) => {
    const evmOnChainConfig = EVMOnChainConfig.getInstance();
    const substrateOnChainConfig = SubstrateOnChainConfig.getInstance();

    const {
      currenciesConfig: onChainConfig,
      fungibleToWrappableMap: evmFungibleToWrappableMap,
      anchorConfig: evmAnchorConfig,
    } = await evmOnChainConfig.fetchCurrenciesConfig(
      parsedAnchorConfig,
      evmProviderFactory
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
      evmAnchorConfig
    );

    const bridgeByAsset = getBridgeConfigByAsset(currenciesConfig, anchors);

    return new ApiConfig(
      config.wallets ?? {},
      config.chains ?? {},
      currenciesConfig,
      bridgeByAsset,
      anchors,
      fungibleToWrappableMap
    );
  };

  getEVMChainName = (evmId: number): string => {
    const chain = Object.values(this.chains).find(
      (chainsConfig) => chainsConfig.chainId === evmId
    );

    if (chain) {
      return chain.name;
    } else {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }
  };

  getChainNameFromTypedChainId = (typedChainId: TypedChainId): string => {
    const chain =
      this.chains[
        calculateTypedChainId(typedChainId.chainType, typedChainId.chainId)
      ];
    return chain.name;
  };

  getNativeCurrencySymbol = (evmId: number): string => {
    const currency = getNativeCurrencyFromConfig(
      this.currencies,
      calculateTypedChainId(ChainType.EVM, evmId)
    );

    return currency?.symbol ?? 'Unknown';
  };

  getCurrencyBySymbol(symbol: string): CurrencyConfig | undefined {
    const currency = Object.keys(this.currencies).find(
      (key) => this.currencies[key as any].symbol === symbol
    );
    return this.currencies[currency as any] ?? undefined;
  }

  getCurrencyByAddress(rawAddress: string): CurrencyConfig | undefined {
    const address = rawAddress.toLowerCase();
    const currency = Object.keys(this.currencies).find((key) => {
      const addresses = Array.from(
        this.currencies[key as any].addresses.values()
      ).map((address) => address.toLowerCase()) as string[];
      return addresses.includes(address);
    });
    return this.currencies[currency as any] ?? undefined;
  }

  getAnchorAddress(fungibleCurrencyId: number, typedChainId: number) {
    const anchor = this.anchors[fungibleCurrencyId];
    if (!anchor) {
      return undefined;
    }
    return anchor[typedChainId];
  }

  getUnavailableCurrencies(
    avaialbleCurrencies: CurrencyConfig[]
  ): CurrencyConfig[] {
    const unavailableCurrencies = Object.values(this.currencies).filter(
      (currency) => !avaialbleCurrencies.find((c) => c.id === currency.id)
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
}
