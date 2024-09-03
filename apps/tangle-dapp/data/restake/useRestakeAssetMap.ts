import type { ApiPromise } from '@polkadot/api';
import { Option, u128 } from '@polkadot/types';
import type {
  PalletAssetsAssetDetails,
  PalletAssetsAssetMetadata,
} from '@polkadot/types/lookup';
import { formatBalance, hexToString } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { useObservable, useObservableState } from 'observable-hooks';
import { mergeMap } from 'rxjs';
import type { Chain } from 'viem';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import type { AssetMap, AssetMetadata } from '../../types/restake';
import hasAssetsPallet from '../../utils/hasAssetsPallet';
import filterNativeAsset from '../../utils/restaking/filterNativeAsset';
import { fetchSingleTokenPrice, fetchTokenPrices } from '../tokenPrice';
import useRestakeAssetIds from './useRestakeAssetIds';

/**
 * Hook to retrieve the asset map for restaking.
 * @returns
 *  - `assetMap`: The asset map.
 *  - `assetMap$`: The observable for the asset map.
 */
export default function useRestakeAssetMap() {
  const { apiPromise } = usePolkadotApi();
  const { activeChain } = useWebContext();

  const { assetIds } = useRestakeAssetIds();

  const assetMap$ = useObservable(
    (input$) =>
      input$.pipe(
        mergeMap(([assetIds, api, nativeCurrentcy]) =>
          mapAssetDetails(assetIds, api, nativeCurrentcy),
        ),
      ),
    [assetIds, apiPromise, activeChain?.nativeCurrency],
  );

  const assetMap = useObservableState(assetMap$, {});

  return {
    assetMap,
    assetMap$,
  };
}

const mapAssetDetails = async (
  assetIds: string[],
  api: ApiPromise,
  nativeCurrentcy: Chain['nativeCurrency'] = {
    name: formatBalance.getDefaults().unit,
    symbol: formatBalance.getDefaults().unit,
    decimals: formatBalance.getDefaults().decimals,
  },
): Promise<AssetMap> => {
  const { hasNative, nonNativeAssetIds } = filterNativeAsset(assetIds);

  if (
    nonNativeAssetIds.length === 0 ||
    !hasAssetsPallet(api, 'query', ['asset', 'metadata']) ||
    api.query.multiAssetDelegation?.assetLookupRewardPools === undefined
  ) {
    return hasNative
      ? await (async () => {
          const nativeAsset = await getNativeAsset(nativeCurrentcy, api);

          return {
            [nativeAsset.id]: nativeAsset,
          };
        })()
      : {};
  }

  // Batch queries for asset details
  const assetDetailQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        [api.query.assets.asset, assetId.toString()] as const,
      ]),
    [] as [typeof api.query.assets.asset, string][],
  );

  // Batch queries for asset metadata
  const assetMetadataQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        [api.query.assets.metadata, assetId.toString()] as const,
      ]),
    [] as [typeof api.query.assets.metadata, string][],
  );

  // Batch queries for asset pool ID
  const assetPoolIdQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        [
          api.query.multiAssetDelegation.assetLookupRewardPools,
          assetId,
        ] as const,
      ]),
    [] as [
      typeof api.query.multiAssetDelegation.assetLookupRewardPools,
      string,
    ][],
  );

  // For TypeScript simplicity, we make 2 separate queries
  // instead of combining them into a single query
  const [assetDetails, assetMetadatas, assetPoolIds] = await Promise.all([
    api.queryMulti<Option<PalletAssetsAssetDetails>[]>(assetDetailQueries),
    api.queryMulti<PalletAssetsAssetMetadata[]>(assetMetadataQueries),
    api.queryMulti<Option<u128>[]>(assetPoolIdQueries),
  ] as const);

  // Get list of token symbols for fetching the prices
  const tokenSymbols = nonNativeAssetIds.map((_, idx) => {
    const metadata = assetMetadatas[idx];
    return hexToString(metadata.symbol.toHex());
  });

  // Fetch the prices of the tokens
  const tokenPrices = await fetchTokenPrices(tokenSymbols);

  const initialAssetMap: AssetMap = hasNative
    ? await (async () => {
        const nativeAsset = await getNativeAsset(nativeCurrentcy, api);

        return {
          [nativeAsset.id]: nativeAsset,
        };
      })()
    : {};

  return nonNativeAssetIds.reduce((assetMap, assetId, idx) => {
    // Ignore if no asset details
    if (assetDetails[idx].isNone) {
      return assetMap;
    }

    const detail = assetDetails[idx].unwrap();
    const metadata = assetMetadatas[idx];
    const poolId = assetPoolIds[idx];

    let name = hexToString(metadata.name.toHex());
    // If the name is empty, we set it to the asset id by default
    if (name.length === 0) {
      name = `Asset ${assetId}`;
    }

    let symbol = hexToString(metadata.symbol.toHex());
    if (symbol.length === 0) {
      symbol = `${assetId}`;
    }

    return Object.assign(assetMap, {
      [assetId]: {
        id: assetId,
        name,
        symbol,
        decimals: metadata.decimals.toNumber(),
        status: detail.status.type,
        poolId: u128ToPoolId(poolId),
        priceInUsd:
          typeof tokenPrices[idx] === 'number' ? tokenPrices[idx] : null,
      },
    } satisfies AssetMap);
  }, initialAssetMap);
};

const u128ToPoolId = (u128: Option<u128>) => {
  if (u128.isNone) return null;

  return u128.unwrap().toString();
};

const getNativeAsset = async (
  nativeCurrency: Chain['nativeCurrency'],
  api: ApiPromise,
) => {
  const assetId = '0';

  // TODO: Remove this on `tangle-substrate-types` v0.5.11
  const poolId =
    await api.query.multiAssetDelegation.assetLookupRewardPools<Option<u128>>(
      assetId,
    );

  const priceInUsd = await fetchSingleTokenPrice(nativeCurrency.symbol);

  return {
    ...nativeCurrency,
    id: assetId,
    status: 'Live',
    poolId: u128ToPoolId(poolId),
    priceInUsd: typeof priceInUsd === 'number' ? priceInUsd : null,
  } satisfies AssetMetadata;
};
