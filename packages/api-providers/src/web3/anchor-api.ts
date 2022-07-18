// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';
import { GovernedTokenWrapper } from '@webb-tools/tokens';

import { AnchorApi } from '../abstracts';
import { TypedChainId } from '../chains';
import { AnchorBase, BridgeConfig, Currency, CurrencyRole, CurrencyType } from '../';
import { WebbWeb3Provider } from './webb-provider';

export class Web3AnchorApi extends AnchorApi<WebbWeb3Provider, BridgeConfig> {
  getTokenAddress(chainTypeId: TypedChainId): string | null {
    const activeBridgeAsset = this.store.activeBridge?.asset;
    const typedChainId = calculateTypedChainId(chainTypeId.chainType, chainTypeId.chainId);
    return activeBridgeAsset ? this.config.currencies[activeBridgeAsset].addresses.get(typedChainId) ?? null : null;
  }

  private get config() {
    return this.inner.config;
  }

  async getCurrencies(): Promise<Currency[]> {
    const currentChainId = await this.inner.getChainId();
    const typedChainId = calculateTypedChainId(ChainType.EVM, currentChainId);
    const bridgeCurrenciesConfig = Object.values(this.config.currencies).filter((i) => {
      const isValid = i.role === CurrencyRole.Governable && i.type === CurrencyType.ERC20;
      const isSupported = Currency.fromCurrencyId(this.config.currencies, i.id).hasChain(typedChainId);

      return isSupported && isValid;
    });

    return bridgeCurrenciesConfig.map((config) => {
      return Currency.fromCurrencyId(this.config.currencies, config.id);
    });
  }

  private get activeBridgeAsset() {
    return this.store.activeBridge?.asset ?? null;
  }

  get currency(): Currency | null {
    return this.activeBridgeAsset ? Currency.fromCurrencyId(this.config.currencies, this.activeBridgeAsset) : null;
  }

  async getAnchors(): Promise<AnchorBase[]> {
    return (
      this.store.activeBridge?.anchors.map((anchor) => ({
        amount: anchor.type === 'fixed' ? anchor.amount : undefined,
        neighbours: anchor.anchorAddresses,
      })) ?? []
    );
  }

  async getWrappableAssets(chainTypeId: TypedChainId): Promise<Currency[]> {
    const bridge = this.activeBridge;
    const calcTypedChainId = calculateTypedChainId(chainTypeId.chainType, chainTypeId.chainId);

    if (!bridge) {
      return [];
    }

    const wrappedTokenAddress = this.getTokenAddress(chainTypeId);

    if (!wrappedTokenAddress) {
      return [];
    }

    // Get the available token addresses which can wrap into the wrappedToken
    const wrappedToken = GovernedTokenWrapper.connect(wrappedTokenAddress, this.inner.getEthersProvider().getSigner());
    const tokenAddresses = await wrappedToken.contract.getTokens();
    // TODO: dynamic wrappable assets - consider some Currency constructor via address & default token config.

    // If the tokenAddress matches one of the wrappableCurrencies, return it
    const wrappableCurrencyIds = this.config.chains[calcTypedChainId].currencies.filter((currencyId) => {
      const wrappableTokenAddress = this.config.currencies[currencyId].addresses.get(calcTypedChainId);

      return wrappableTokenAddress && tokenAddresses.includes(wrappableTokenAddress);
    });

    if (await wrappedToken.contract.isNativeAllowed()) {
      wrappableCurrencyIds.push(this.config.chains[calcTypedChainId].nativeCurrencyId);
    }

    const wrappableCurrencies = wrappableCurrencyIds.map((currencyId) => {
      return Currency.fromCurrencyId(this.config.currencies, currencyId);
    });

    return wrappableCurrencies;
  }
}
