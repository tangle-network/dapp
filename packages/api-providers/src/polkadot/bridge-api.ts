// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BridgeApi } from '../abstracts';
import { Currency } from '..';
import { WebbPolkadot } from './webb-provider';

type AssetType =
  | {
      poolShare?: number[];
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
    console.log(governedTokenAddress);
    if (!governedTokenAddress) {
      return wrappableTokens;
    }

    const tokens = await this.inner.api.query.assetRegistry.assets.entries();
    const assets = tokens.map(
      ([, token], index) =>
        ({
          id: index,
          ...(token.toHuman() as any),
        } as unknown as AssetMetadata)
    );
    // @ts-ignore
    const poolShares = assets.filter((asset) => typeof asset.assetType.poolShare !== 'undefined');
    const ORMLAssetMetaData: AssetMetadata[] = [];

    for (const poolshare of poolShares) {
      // @ts-ignore
      const writableAssetsIds = poolshare.assetType.poolShare!.map((assetId) => Number(assetId));
      for (const writableAssetsId of writableAssetsIds) {
        if (ORMLAssetMetaData.findIndex((asset) => asset.id === writableAssetsId) === -1) {
          ORMLAssetMetaData.push(assets[writableAssetsId]);
        }
      }
      const configCurrencies = this.inner.state.getCurrencies();

      return wrappableTokens;
    }
  }
}
