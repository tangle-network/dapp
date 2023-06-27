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
import { ethers } from 'ethers';
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
import { parsedAnchorConfig } from './anchors';
import assert from 'assert';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@webb-tools/utils';

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
    evmProviderFactory: (
      typedChainId: number
    ) => Promise<ethers.providers.Web3Provider>,
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

  getEVMChainName(evmId: number): string {
    const chain = Object.values(this.chains).find(
      (chainsConfig) => chainsConfig.chainId === evmId
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
      calculateTypedChainId(ChainType.EVM, evmId)
    );

    return currency?.symbol ?? 'Unknown';
  }

  getCurrencyBySymbolAndTypedChainId(
    symbol: string,
    typedChainId: number
  ): CurrencyConfig | undefined {
    return Object.values(this.currencies).find(
      (currencyCfg) =>
        currencyCfg.symbol === symbol && currencyCfg.addresses.has(typedChainId)
    );
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

  /**
   * Parse the target system then compare with the anchor identifier
   * @param anchorIdentifier the anchor identifier, either the anchor address on evm or tree id on substrate
   * @param targetSystem the target system, which is get from the resource id (it should be 26 bytes)
   * @returns true if the anchor identifier is matched with the target system
   */
  isEqTargetSystem(
    anchorIdentifier: `0x${string}`,
    targetSystem: Uint8Array
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
}
