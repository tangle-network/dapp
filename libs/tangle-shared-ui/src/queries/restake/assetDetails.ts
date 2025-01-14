import { ApiPromise, ApiRx } from '@polkadot/api';
import type { Option, u32 } from '@polkadot/types';
import type {
  PalletAssetsAssetDetails,
  PalletAssetsAssetMetadata,
} from '@polkadot/types/lookup';
import { formatBalance, hexToString } from '@polkadot/util';
import type { Chain } from '@webb-tools/dapp-config';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import {
  RestakeVaultAssetMap,
  RestakeVaultAssetMetadata,
} from '../../types/restake';
import filterNativeAsset from '../../utils/restake/filterNativeAsset';
import { fetchSingleTokenPrice, fetchTokenPrices } from '../tokenPrice';
import { isEvmAddress, isTemplateNumber } from '@webb-tools/webb-ui-components';
import assert from 'assert';

function createVaultId(u32: Option<u32>): number | null {
  if (u32.isNone) {
    return null;
  }

  return u32.unwrap().toNumber();
}

function isApiSupported(api: ApiPromise | ApiRx) {
  const isAssetsQueryUndefined = api.query?.assets?.asset === undefined;
  const isMetadataQueryUndefined = api.query?.assets?.metadata === undefined;

  const isVaultsQueryUndefined =
    api.query.rewards?.assetLookupRewardVaults === undefined;

  return (
    !isAssetsQueryUndefined &&
    !isMetadataQueryUndefined &&
    !isVaultsQueryUndefined
  );
}

const DEFAULT_NATIVE_CURRENCY = {
  name: formatBalance.getDefaults().unit,
  symbol: formatBalance.getDefaults().unit,
  decimals: formatBalance.getDefaults().decimals,
};

// Combined process function for both regular and Rx versions
function createAssetMetadata(
  assetId: string,
  detail: PalletAssetsAssetDetails,
  metadata: PalletAssetsAssetMetadata,
  vaultId: Option<u32>,
  priceInUsd: number | null,
): RestakeVaultAssetMetadata {
  const name = hexToString(metadata.name.toHex()) || `Asset ${assetId}`;
  const symbol = hexToString(metadata.symbol.toHex()) || `${assetId}`;
  const decimals = metadata.decimals.toNumber();

  assert(isEvmAddress(assetId) || isTemplateNumber(assetId));

  return {
    id: assetId,
    name,
    symbol,
    decimals,
    status: detail.status.type,
    vaultId: createVaultId(vaultId),
    priceInUsd,
    details: detail,
  } satisfies RestakeVaultAssetMetadata;
}

function queryTokenPrices(
  nonNativeAssetIds: string[],
  assetMetadatas: PalletAssetsAssetMetadata[],
) {
  const tokenSymbols = nonNativeAssetIds.map((_, idx) =>
    hexToString(assetMetadatas[idx].symbol.toHex()),
  );
  return fetchTokenPrices(tokenSymbols);
}

function processAssetDetailsRx(
  api: ApiRx,
  nonNativeAssetIds: string[],
  assetDetails: Option<PalletAssetsAssetDetails>[],
  assetMetadatas: PalletAssetsAssetMetadata[],
  assetVaultIds: Option<u32>[],
  hasNative: boolean,
  nativeCurrency: Chain['nativeCurrency'],
): Observable<RestakeVaultAssetMap> {
  return hasNative
    ? getNativeAssetRx(nativeCurrency, api).pipe(
        map((nativeAsset) => ({ [nativeAsset.id]: nativeAsset })),
      )
    : of<RestakeVaultAssetMap>({}).pipe(
        switchMap(async (initialAssetMap) => {
          const tokenPrices = await queryTokenPrices(
            nonNativeAssetIds,
            assetMetadatas,
          );

          return nonNativeAssetIds.reduce((assetMap, assetId, idx) => {
            if (assetDetails[idx].isNone) {
              return assetMap;
            }

            return {
              ...assetMap,
              [assetId]: createAssetMetadata(
                assetId,
                assetDetails[idx].unwrap(),
                assetMetadatas[idx],
                assetVaultIds[idx],
                typeof tokenPrices[idx] === 'number' ? tokenPrices[idx] : null,
              ),
            };
          }, initialAssetMap);
        }),
      );
}

function getNativeAssetRx(
  nativeCurrency: Chain['nativeCurrency'],
  api: ApiRx,
): Observable<RestakeVaultAssetMetadata> {
  const assetId = 0;

  return api.query.rewards.assetLookupRewardVaults({ Custom: assetId }).pipe(
    switchMap(async (vaultId) => {
      const priceInUsd = await fetchSingleTokenPrice(nativeCurrency.symbol);

      return {
        ...nativeCurrency,
        id: `${assetId}`,
        status: 'Live' as const,
        vaultId: createVaultId(vaultId),
        priceInUsd: typeof priceInUsd === 'number' ? priceInUsd : null,
      } satisfies RestakeVaultAssetMetadata;
    }),
  );
}

export const assetDetailsRxQuery = (
  api: ApiRx,
  assetIds: string[],
  nativeCurrency: Chain['nativeCurrency'] = DEFAULT_NATIVE_CURRENCY,
) => {
  const { hasNative, nonNativeAssetIds } = filterNativeAsset(assetIds);
  const isNonNativeAssetsEmpty = nonNativeAssetIds.length === 0;

  if (isNonNativeAssetsEmpty || !isApiSupported(api)) {
    if (hasNative) {
      return getNativeAssetRx(nativeCurrency, api).pipe(
        map((nativeAsset) => ({ [nativeAsset.id]: nativeAsset })),
      );
    } else {
      return of<{
        [assetId: string]: RestakeVaultAssetMetadata;
      }>({});
    }
  }

  // Batch queries for asset details
  const assetDetailQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        [api.query.assets.asset, { Custom: assetId.toString() }] as const,
      ]),
    [] as [typeof api.query.assets.asset, { Custom: string }][],
  );

  // Batch queries for asset metadata
  const assetMetadataQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        [api.query.assets.metadata, { Custom: assetId.toString() }] as const,
      ]),
    [] as [typeof api.query.assets.metadata, { Custom: string }][],
  );

  // Batch queries for asset vault ID
  const assetVaultIdQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) =>
      batchQueries.concat([
        [
          api.query.rewards.assetLookupRewardVaults,
          { Custom: assetId },
        ] as const,
      ]),
    [] as [
      typeof api.query.rewards.assetLookupRewardVaults,
      { Custom: string },
    ][],
  );

  const assetDetails$ =
    api.queryMulti<Option<PalletAssetsAssetDetails>[]>(assetDetailQueries);

  const assetMetadatas$ =
    api.queryMulti<PalletAssetsAssetMetadata[]>(assetMetadataQueries);

  // TODO: Wrong type. Affected by {Custom:...} bug?
  const assetVaultIds$ = api.queryMulti<Option<u32>[]>(assetVaultIdQueries);

  return combineLatest([assetDetails$, assetMetadatas$, assetVaultIds$]).pipe(
    switchMap(([assetDetails, assetMetadatas, assetVaultIds]) => {
      return processAssetDetailsRx(
        api,
        nonNativeAssetIds,
        assetDetails,
        assetMetadatas,
        assetVaultIds,
        hasNative,
        nativeCurrency,
      );
    }),
  );
};
