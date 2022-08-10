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
  name: string;
  assetType: AssetType;
  existentialDeposit: number;
  locked: boolean;
}
export class PolkadotBridgeApi extends BridgeApi<WebbPolkadot> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchWrappableAssets(typedChainId: number): Promise<Currency[]> {
    const tokens = await this.inner.api.query.assetRegistry.assets.entries();
    const assets = tokens.map(([, token]) => token.toHuman() as unknown as AssetMetadata);
    // @ts-ignore
    const poolShares = assets.filter((asset) => typeof asset.assetType.poolShare !== 'undefined');
    const ORMLAssetIds: number[] = [];
    for (const poolshare of poolShares) {
      // @ts-ignore
      const writableAssetsIds = poolshare.assetType.poolShare!.map((assetId) => Number(assetId));
      for (const writableAssetsId of writableAssetsIds) {
        if (!ORMLAssetIds.includes(writableAssetsId)) {
          ORMLAssetIds.push(writableAssetsId);
        }
      }
    }
    const configCurrencies = this.inner.state.getCurrencies();
    console.log('fetchWrappableAssets: ');
    // All Substrate assets are assumed to be wrappable
    return Object.values(this.inner.state.getCurrencies()).filter((currency) => {
      currency.hasChain(typedChainId);
    });
  }
}
