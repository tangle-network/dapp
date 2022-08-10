// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BridgeApi } from '../abstracts';
import { Currency, CurrencyId, CurrencyRole, CurrencyType } from '..';
import { WebbPolkadot } from './webb-provider';

type AssetType =
  | {
      PoolShare?: number[];
    }
  | 'Token';

interface AssetMetadata {
  id: number;
  name: string;
  assetType: AssetType;
  existentialDeposit: number;
  locked: boolean;
}

export class PolkadotBridgeApi extends BridgeApi<WebbPolkadot> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchWrappableAssets(typedChainId: number): Promise<Currency[]> {
    const wrappableTokens: Currency[] = [];
    const bridge = this.getBridge();
    if (!bridge) {
      return wrappableTokens;
    }

    const governedTokenAddress = this.getTokenTarget(typedChainId);
    console.log(`governedTokenAddress: ${governedTokenAddress}`);
    if (!governedTokenAddress) {
      return wrappableTokens;
    }

    const tokens = await this.inner.api.query.assetRegistry.assets.entries();
    const assets = tokens.map(
      ([key, token]) =>
        ({
          // @ts-ignore
          id: Number(key.toHuman()[0]),
          ...(token.toHuman() as any),
        } as unknown as AssetMetadata)
    );
    const poolshare = assets.find((asset) => {
      return asset.id === Number(governedTokenAddress);
    })!;
    const ORMLAssetMetaData: AssetMetadata[] = [];

    // @ts-ignore
    const wrappableAssetIds = poolshare.assetType.PoolShare!.map((assetId) => Number(assetId));
    for (const wrappableAssetId of wrappableAssetIds) {
      if (ORMLAssetMetaData.findIndex((asset) => asset.id === wrappableAssetId) === -1) {
        const assetMetaData = assets.find((asset) => asset.id === wrappableAssetId);
        ORMLAssetMetaData.push(assetMetaData!);
      }
    }
    for (const currencyMetaData of ORMLAssetMetaData) {
      console.log(this.inner.state.getReverseCurrencyMap());
      const currencyRegistered = this.inner.state
        .getReverseCurrencyMapWithChainId(typedChainId)
        .get(currencyMetaData.id.toString());
      const knownCurrencies = this.inner.state.getCurrencies();
      if (typeof currencyRegistered === 'undefined') {
        const wrappableTokenLength = Object.keys(knownCurrencies).length;
        const newToken: Currency = new Currency({
          addresses: new Map<number, string>([[typedChainId, currencyMetaData.id.toString()]]),
          decimals: 18,
          id: CurrencyId.DYNAMIC_CURRENCY_STARTING_ID + wrappableTokenLength,
          name: currencyMetaData.name,
          role: CurrencyRole.Wrappable,
          symbol: currencyMetaData.name,
          type: CurrencyType.ORML,
        });
        this.inner.state.addCurrency(newToken);
        wrappableTokens.push(newToken);
      } else {
        wrappableTokens.push(knownCurrencies[currencyRegistered]);
      }
    }

    return wrappableTokens;
  }
}
