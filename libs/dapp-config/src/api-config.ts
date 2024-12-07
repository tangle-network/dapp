// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import values from 'lodash/values';
import { ChainConfig } from './chains/chain-config.interface';
import { WalletConfig } from './wallets/wallet-config.interface';

export type Chain = ChainConfig & {
  wallets: Array<Wallet['id']>;
};

export type Wallet = WalletConfig;

export type ApiConfigInput = {
  wallets?: Record<number, WalletConfig>;
  chains?: Record<number, ChainConfig>;
};

export class ApiConfig {
  constructor(
    /**
     * id -> wallet config
     */
    public wallets: Record<number, WalletConfig>,
    /**
     * typed chain id -> chain config
     */
    public chains: Record<number, ChainConfig>,
  ) {}

  static init = (config: ApiConfigInput) => {
    return new ApiConfig(config.wallets ?? {}, config.chains ?? {});
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

  /**
   * Get all supported wallets that have at least one supported chain id
   * in the given supported typed chain ids if the typed chain id is not provided,
   * otherwise, first filter the wallets by the given typed chain id
   * @param typedChainId the typed chain id to filter the wallets
   * @param opts.filterByAnchor if true, only return the wallets that have the anchor @default true
   * @returns all supported wallets that have at least one supported chain id
   */
  getSupportedWallets(typedChainId?: number): WalletConfig[] {
    const wallets =
      typeof typedChainId === 'number'
        ? values(this.wallets).filter((walletCfg) =>
            walletCfg.supportedChainIds.includes(typedChainId),
          )
        : values(this.wallets);

    return wallets;
  }
}
