import type { ApiPromise } from '@polkadot/api';
import type { Option, u128, Vec } from '@polkadot/types';
import type {
  PalletAssetsAssetDetails,
  PalletAssetsAssetMetadata,
} from '@polkadot/types/lookup';
import { formatBalance } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useObservable, useObservableState } from 'observable-hooks';
import { mergeMap, withLatestFrom } from 'rxjs';
import type { Chain } from 'viem';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import { AssetMap, AssetMetadata } from '../../types/restake';
import useRestakingAssetIds from './useRestakingAssetIds';

const EMPTY_ASSET_MAP = {} satisfies AssetMap as AssetMap;

export default function useRestakingAssetMap() {
  const { apiPromise } = usePolkadotApi();
  const { activeChain } = useWebContext();

  const { assetIds$ } = useRestakingAssetIds();

  const assetMap$ = useObservable(
    (input$) =>
      assetIds$.pipe(
        withLatestFrom(input$),
        mergeMap(([assetIds, [api, nativeCurrentcy]]) =>
          mapAssetDetails(assetIds, api, nativeCurrentcy),
        ),
      ),
    [apiPromise, activeChain?.nativeCurrency],
  );

  const assetMap = useObservableState(assetMap$, EMPTY_ASSET_MAP);

  return {
    assetMap,
    assetMap$,
  };
}

const mapAssetDetails = async (
  assetIds: Vec<u128>,
  api: ApiPromise,
  nativeCurrentcy: Chain['nativeCurrency'] = {
    name: formatBalance.getDefaults().unit,
    symbol: formatBalance.getDefaults().unit,
    decimals: formatBalance.getDefaults().decimals,
  },
) => {
  let hasNative = false;

  // Filter out the native asset ID
  // as it not exist in the assets module
  const nonNativeAssetIds = assetIds.filter((assetId) => {
    if (assetId.isZero()) {
      hasNative = true;
      return false;
    }

    return true;
  });

  // Batch queries for asset details
  const assetDetailQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        api.query.assets.asset,
        assetId.toString(),
      ] as const),
    [] as [typeof api.query.assets.asset, string][],
  );

  // Batch queries for asset metadata
  const assetMetadataQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        api.query.assets.metadata,
        assetId.toString(),
      ] as const),
    [] as [typeof api.query.assets.metadata, string][],
  );

  // For TypeScript simplicity, we make 2 separate queries
  // instead of combining them into a single query
  const [assetDetails, assetMetadatas] = await Promise.all([
    api.queryMulti<Option<PalletAssetsAssetDetails>[]>(assetDetailQueries),
    api.queryMulti<PalletAssetsAssetMetadata[]>(assetMetadataQueries),
  ] as const);

  return nonNativeAssetIds.reduce(
    (assetMap, assetId, idx) => {
      // Ignore if no asset details
      if (assetDetails[idx].isNone) {
        return assetMap;
      }

      const detail = assetDetails[idx].unwrap();
      const metadata = assetMetadatas[idx];

      return Object.assign(assetMap, {
        [assetId.toString()]: {
          id: assetId.toString(),
          name: metadata.name.toString(),
          symbol: metadata.symbol.toString(),
          decimals: metadata.decimals.toNumber(),
          status: detail.status.type,
        },
      } satisfies AssetMap);
    },
    (hasNative
      ? {
          '0': {
            ...nativeCurrentcy,
            id: '0',
            status: 'Live',
          } satisfies AssetMetadata,
        }
      : {}) as typeof EMPTY_ASSET_MAP,
  );
};
