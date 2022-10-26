// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { TypedChainId } from '@nepoche/dapp-types/ChainId';
import { WebbError, WebbErrorCodes } from '@nepoche/dapp-types/WebbError';
import { calculateTypedChainId } from '@webb-tools/sdk-core';

import { AnchorConfigEntry } from './anchors/anchor-config.interface';
import { BridgeConfigEntry } from './bridges/bridge-config.interface';
import { ChainConfig } from './chains/chain-config.interface';
import { CurrencyConfig } from './currencies/currency-config.interface';
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

  getEVMChainName = (evmId: number): string => {
    const chain = Object.values(this.chains).find((chainsConfig) => chainsConfig.chainId === evmId);

    if (chain) {
      return chain.name;
    } else {
      throw WebbError.from(WebbErrorCodes.UnsupportedChain);
    }
  };

  getChainNameFromTypedChainId = (typedChainId: TypedChainId): string => {
    const chain = this.chains[calculateTypedChainId(typedChainId.chainType, typedChainId.chainId)];
    return chain.name;
  };

  getNativeCurrencySymbol = (evmId: number): string => {
    const chain = Object.values(this.chains).find((chainsConfig) => chainsConfig.chainId === evmId);

    if (chain) {
      const nativeCurrency = chain.nativeCurrencyId;

      return this.currencies[nativeCurrency].symbol;
    }

    return 'Unknown';
  };
}
