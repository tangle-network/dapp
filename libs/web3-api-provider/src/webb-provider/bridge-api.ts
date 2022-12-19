// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import { Bridge, BridgeApi, Currency } from '@webb-tools/abstract-api-provider';
import { CurrencyRole, CurrencyType } from '@webb-tools/dapp-types';
import { CurrencyId } from '@webb-tools/dapp-types';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';

import { WebbWeb3Provider } from '../webb-provider';
import { FungibleTokenWrapper } from '@webb-tools/tokens';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
console.log({ FungibleTokenWrapper__factory });
export class Web3BridgeApi extends BridgeApi<WebbWeb3Provider> {
  async fetchWrappableAssetsByBridge(
    typedChainId: number,
    bridge: Bridge
  ): Promise<Currency[]> {
    const wrappableTokens: Currency[] = [];
    const bridgeAsset = bridge.currency;
    const governedTokenAddress = bridgeAsset.getAddress(typedChainId);
    if (!governedTokenAddress) {
      return wrappableTokens;
    }

    // Get the available token addresses which can wrap into the wrappedToken
    const governedToken = FungibleTokenWrapper.connect(
      governedTokenAddress,
      this.inner.getEthersProvider().getSigner()
    );
    const allTokenAddresses = await governedToken.contract.getTokens();

    await Promise.all(
      allTokenAddresses.map(async (tokenAddress) => {
        const registeredCurrency = this.inner.state
          .getReverseCurrencyMapWithChainId(typedChainId)
          .get(tokenAddress);
        const knownCurrencies = this.inner.state.getCurrencies();

        if (!registeredCurrency) {
          // Read data about the new currencyAddress
          const newERC20Token = ERC20Factory.connect(
            tokenAddress,
            this.inner.getEthersProvider()
          );
          const decimals = await newERC20Token.decimals();
          const name = await newERC20Token.name();
          const symbol = await newERC20Token.symbol();
          const wrappableTokenLength = Object.keys(knownCurrencies).length;

          const newToken: Currency = new Currency({
            //TODO: Ensure the webbState has the right address map (EX: the token is in another chain)
            addresses: new Map<number, string>([[typedChainId, tokenAddress]]),
            decimals: decimals,
            id: CurrencyId.DYNAMIC_CURRENCY_STARTING_ID + wrappableTokenLength,
            name: name,
            role: CurrencyRole.Wrappable,
            symbol: symbol,
            type: CurrencyType.ERC20,
          });

          // Add any newly discovered currencies to the state
          this.inner.state.addCurrency(newToken);

          wrappableTokens.push(newToken);
        } else {
          wrappableTokens.push(knownCurrencies[registeredCurrency]);
        }
      })
    );

    // Add the chain's native currency if the wrappableToken allows native
    if (await governedToken.contract.isNativeAllowed()) {
      wrappableTokens.push(
        new Currency(
          this.inner.config.currencies[
            this.inner.config.chains[typedChainId].nativeCurrencyId
          ]
        )
      );
    }

    return wrappableTokens;
  }
  async fetchWrappableAssets(typedChainId: number): Promise<Currency[]> {
    const bridge = this.getBridge();
    return this.fetchWrappableAssetsByBridge(typedChainId, bridge);
  }
}
