// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0
import { Bridge, BridgeApi, Currency } from '@webb-tools/abstract-api-provider';
import { FungibleTokenWrapper__factory } from '@webb-tools/contracts';
import {
  ensureHex,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import { getContract } from 'viem';
import { WebbWeb3Provider } from '../webb-provider';

export class Web3BridgeApi extends BridgeApi<WebbWeb3Provider> {
  async fetchWrappableAssetsByBridge(
    typedChainId: number,
    bridge: Bridge,
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
      client: this.inner.publicClient,
    });

    const [, isNativeAllowed] = await Promise.all([
      fungibleContract.read.getTokens(),
      fungibleContract.read.isNativeAllowed(),
    ]);

    // Add the chain's native currency if the wrappableToken allows native
    if (isNativeAllowed) {
      const currencyConfig = getNativeCurrencyFromConfig(
        this.inner.config.currencies,
        typedChainId,
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
