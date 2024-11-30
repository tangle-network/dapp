// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { TypedChainId } from '@webb-tools/dapp-types/ChainId';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types/WebbError';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { ChainConfig } from './chains/chain-config.interface';
import { WalletConfig } from './wallets/wallet-config.interface';
import values from 'lodash/values';
import { isAppEnvironmentType } from './types';

export type Chain = ChainConfig & {
  wallets: Array<Wallet['id']>;
};

export type Wallet = WalletConfig;

export type ApiConfigInput = {
  wallets?: Record<number, WalletConfig>;
  chains?: Record<number, ChainConfig>;
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
  ) {
    const typedChainIdsSet = new Set<number>();

    this.supportedTypedChainIds = typedChainIdsSet;
  }

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

  getChainNameFromTypedChainId(typedChainId: TypedChainId): string {
    const chain =
      this.chains[
        calculateTypedChainId(typedChainId.chainType, typedChainId.chainId)
      ];
    return chain.name;
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
