// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import { Bridge, BridgeApi, Currency } from '@webb-tools/abstract-api-provider';
import {
  ERC20__factory as ERC20Factory,
  FungibleTokenWrapper__factory,
} from '@webb-tools/contracts';
import {
  ensureHex,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import {
  CurrencyRole,
  CurrencyType,
  checkNativeAddress,
} from '@webb-tools/dapp-types';
import { getContract } from 'viem';
import { WebbWeb3Provider } from '../webb-provider';

export class Web3BridgeApi extends BridgeApi<WebbWeb3Provider> {
  async fetchWrappableAssetsByBridge(
    typedChainId: number,
    bridge: Bridge
  ): Promise<Currency[]> {
    const wrappableTokens: Currency[] = [];
    const bridgeAsset = bridge.currency;
    const fungibleTokenAddress = bridgeAsset.getAddress(typedChainId);
    if (!fungibleTokenAddress) {
      return wrappableTokens;
    }

    // Get the available token addresses which can wrap into the wrappedToken
    const fungibleContract = getContract({
      address: ensureHex(fungibleTokenAddress),
      abi: FungibleTokenWrapper__factory.abi,
      publicClient: this.inner.publicClient,
    });

    const [allTokenAddresses, isNativeAllowed] = await Promise.all([
      fungibleContract.read.getTokens(),
      fungibleContract.read.isNativeAllowed(),
    ]);

    await Promise.all(
      allTokenAddresses.map(async (tokenAddress) => {
        const registeredCurrency = this.inner.state
          .getReverseCurrencyMapWithChainId(typedChainId)
          .get(tokenAddress);

        const knownCurrencies = this.inner.state.getCurrencies();

        if (!registeredCurrency) {
          // Read data about the new currencyAddress
          const newERC20Token = getContract({
            address: tokenAddress,
            abi: ERC20Factory.abi,
            publicClient: this.inner.publicClient,
          });

          const [decimals, name, symbol] = await Promise.all([
            newERC20Token.read.decimals(),
            newERC20Token.read.name(),
            newERC20Token.read.symbol(),
          ]);

          const nextCurrencyId = Object.keys(
            this.inner.config.currencies
          ).length;

          const newToken: Currency = new Currency({
            //TODO: Ensure the webbState has the right address map (EX: the token is in another chain)
            addresses: new Map<number, string>([[typedChainId, tokenAddress]]),
            decimals: decimals,
            id: nextCurrencyId,
            name: name,
            role: CurrencyRole.Wrappable,
            symbol: symbol,
            type: CurrencyType.ERC20,
          });
          // Add any newly discovered currencies to the state
          this.inner.state.addCurrency(newToken);

          wrappableTokens.push(newToken);
        } else {
          // don't add if this currency is the native currency
          if (!checkNativeAddress(tokenAddress)) {
            wrappableTokens.push(knownCurrencies[registeredCurrency]);
          }
        }
      })
    );

    // Add the chain's native currency if the wrappableToken allows native
    if (isNativeAllowed) {
      const currencyConfig = getNativeCurrencyFromConfig(
        this.inner.config.currencies,
        typedChainId
      );
      if (currencyConfig) {
        wrappableTokens.push(new Currency(currencyConfig));
      } else {
        console.error(`Native currency not found for chainId: ${typedChainId}`);
      }
    }

    return wrappableTokens;
  }

  async fetchWrappableAssets(typedChainId: number): Promise<Currency[]> {
    const bridge = this.getBridge();
    if (!bridge) {
      return [];
    }

    return this.fetchWrappableAssetsByBridge(typedChainId, bridge);
  }
}
