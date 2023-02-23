// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { TypedChainId } from '@webb-tools/dapp-types/ChainId';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { ChainType, calculateTypedChainId } from '@webb-tools/sdk-core';

import { ethers } from 'ethers';
import {
  anchorDeploymentBlock,
  getAnchorConfig,
  getLatestAnchorAddress,
} from './anchors';
import { AnchorConfigEntry } from './anchors/anchor-config.interface';
import { getBridgeConfigByAsset } from './bridges';
import { BridgeConfigEntry } from './bridges/bridge-config.interface';
import { ChainConfig } from './chains/chain-config.interface';
import { CurrencyConfig } from './currencies/currency-config.interface';
import { fetchEVMCurrenciesConfig, getNativeCurrencyFromConfig } from './utils';
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
};

// For the fetching currency on chain effect
const parsedAnchorConfig = Object.keys(anchorDeploymentBlock).reduce(
  (acc, typedChainId) => {
    const address = getLatestAnchorAddress(+typedChainId);
    if (address) {
      acc[+typedChainId] = address;
    }
    return acc;
  },
  {} as Record<number, string>
);

export class ApiConfig {
  constructor(
    public wallets: Record<number, WalletConfig>,
    public chains: Record<number, ChainConfig>,
    public currencies: Record<number, CurrencyConfig>,
    public bridgeByAsset: Record<number, BridgeConfigEntry>,
    public anchors: Record<number, AnchorConfigEntry>
  ) {}

  static init = (config: ApiConfigInput) => {
    return new ApiConfig(
      config.wallets ?? {},
      config.chains ?? {},
      config.currencies ?? {},
      config.bridgeByAsset ?? {},
      config.anchors ?? {}
    );
  };

  static initFromApi = async (
    config: Pick<ApiConfigInput, 'chains' | 'wallets'>,
    providerFactory: (typedChainId: number) => ethers.providers.Provider
  ) => {
    const currenciesOnChain = await fetchEVMCurrenciesConfig(
      parsedAnchorConfig,
      providerFactory
    );

    const anchors = await getAnchorConfig(currenciesOnChain);

    const bridgeByAsset = await getBridgeConfigByAsset(currenciesOnChain);

    return new ApiConfig(
      config.wallets ?? {},
      config.chains ?? {},
      currenciesOnChain,
      bridgeByAsset,
      anchors
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
}
