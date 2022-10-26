// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import { BridgeApi, Currency } from '@nepoche/abstract-api-provider';
import { CurrencyRole, CurrencyType } from '@nepoche/dapp-types';
import { CurrencyId } from '@nepoche/dapp-types';
import { ERC20__factory as ERC20Factory } from '@webb-tools/contracts';
import { GovernedTokenWrapper } from '@webb-tools/tokens';

import { WebbWeb3Provider } from '../webb-provider';

export class Web3BridgeApi extends BridgeApi<WebbWeb3Provider> {
  async fetchWrappableAssets(typedChainId: number): Promise<Currency[]> {
    const bridge = this.getBridge();
    let wrappableTokens: Currency[] = [];

    if (!bridge) {
      return wrappableTokens;
    }

    const governedTokenAddress = this.getTokenTarget(typedChainId);

    if (!governedTokenAddress) {
      return wrappableTokens;
    }

    // Get the available token addresses which can wrap into the wrappedToken
    const governedToken = GovernedTokenWrapper.connect(
      governedTokenAddress,
      this.inner.getEthersProvider().getSigner()
    );
    const allTokenAddresses = await governedToken.contract.getTokens();

    await Promise.all(
      allTokenAddresses.map(async (tokenAddress) => {
        const registeredCurrency = this.inner.state.getReverseCurrencyMap().get(tokenAddress);
        const knownCurrencies = this.inner.state.getCurrencies();

        if (!registeredCurrency) {
          // Read data about the new currencyAddress
          const newERC20Token = ERC20Factory.connect(tokenAddress, this.inner.getEthersProvider());
          const decimals = await newERC20Token.decimals();
          const name = await newERC20Token.name();
          const symbol = await newERC20Token.symbol();
          const wrappableTokenLength = Object.keys(knownCurrencies).length;

          const newToken: Currency = new Currency({
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
        new Currency(this.inner.config.currencies[this.inner.config.chains[typedChainId].nativeCurrencyId])
      );
    }

    return wrappableTokens;
  }
}
