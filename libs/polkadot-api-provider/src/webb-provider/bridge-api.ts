/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { Currency } from '@webb-tools/abstract-api-provider';
import { BridgeApi } from '@webb-tools/abstract-api-provider';
import { CurrencyRole, CurrencyType } from '@webb-tools/dapp-types';

import { WebbPolkadot } from '../webb-provider';

interface AssetMetadata {
  id: number;
  name: string;
  isPoolShare: boolean;
  tokens: string[] | null;
  existentialDeposit: string;
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

    const fungibleTokenAddress = this.getTokenTarget(typedChainId);
    if (!fungibleTokenAddress) {
      return wrappableTokens;
    }

    const tokens = await this.inner.api.query.assetRegistry.assets.entries();
    const assets = tokens
      .filter(([, metadata]) => metadata.isSome)

      .map(([key, token]) => {
        const details = token.unwrap();
        const id = Number(key.args[0].toString());
        return {
          id,
          name: details.name.toHuman(),
          isPoolShare: details.assetType.isPoolShare,
          tokens: details.assetType.isPoolShare
            ? details.assetType.asPoolShare.map((i) => i.toString())
            : null,
          existentialDeposit: details.existentialDeposit.toString(),
          locked: details.locked.isTrue,
        } as unknown as AssetMetadata;
      });
    const poolshare = assets.find((asset) => {
      return asset.id === Number(fungibleTokenAddress);
    })!;
    console.log(assets);
    const ORMLAssetMetaData: AssetMetadata[] = [];

    const wrappableAssetIds = poolshare.tokens!.map((assetId) =>
      Number(assetId),
    );
    for (const wrappableAssetId of wrappableAssetIds) {
      if (
        ORMLAssetMetaData.findIndex(
          (asset) => asset.id === wrappableAssetId,
        ) === -1
      ) {
        const assetMetaData = assets.find(
          (asset) => asset.id === wrappableAssetId,
        );
        ORMLAssetMetaData.push(assetMetaData!);
      }
    }
    for (const currencyMetaData of ORMLAssetMetaData) {
      const currencyRegistered = this.inner.state
        .getReverseCurrencyMapWithChainId(typedChainId)
        .get(currencyMetaData.id.toString());
      const knownCurrencies = this.inner.state.getCurrencies();
      if (typeof currencyRegistered === 'undefined') {
        const nextCurrencyId = Object.keys(this.inner.config.currencies).length;
        const newToken: Currency = new Currency({
          addresses: new Map<number, string>([
            [typedChainId, currencyMetaData.id.toString()],
          ]),
          decimals: 18,
          id: nextCurrencyId,
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
