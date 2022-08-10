// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

import { BridgeApi } from '../abstracts';
import { Currency } from '..';
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
    // @ts-ignore
    const poolShares = assets.filter((asset) => {
      // @ts-ignore
      const isPoolShare = typeof asset.assetType.PoolShare !== 'undefined';
      // @ts-ignore
      const wrappingTheCurrentActiveGovernedToken = asset.assetType.PoolShare?.includes(governedTokenAddress);
      return isPoolShare && wrappingTheCurrentActiveGovernedToken;
    });
    const ORMLAssetMetaData: AssetMetadata[] = [];

    for (const poolshare of poolShares) {
      // @ts-ignore
      const wrappableAssetIds = poolshare.assetType.PoolShare!.map((assetId) => Number(assetId));
      console.log({ wrappableAssetIds });
      for (const wrappableAssetId of wrappableAssetIds) {
        if (ORMLAssetMetaData.findIndex((asset) => asset.id === wrappableAssetId) === -1) {
          const assetMetaData = assets.find((asset) => asset.id === wrappableAssetId);
          ORMLAssetMetaData.push(assetMetaData!);
        }
      }
    }
    // Adding PoolShares to currencies
    //Adding Wrappable currencies to currencies

    return wrappableTokens;
  }
}
