import { ApiPromise, ApiRx } from '@polkadot/api';
import type { Option, u128 } from '@polkadot/types';
import type {
  PalletAssetsAssetDetails,
  PalletAssetsAssetMetadata,
} from '@polkadot/types/lookup';
import { formatBalance, hexToString } from '@polkadot/util';
import type { Chain } from '@webb-tools/dapp-config';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { AssetMap, AssetMetadata } from '../../types/restake';
import filterNativeAsset from '../../utils/restake/filterNativeAsset';
import { fetchSingleTokenPrice, fetchTokenPrices } from '../tokenPrice';

function u128ToVaultId(u128: Option<u128>) {
  if (u128.isNone) return null;

  return u128.unwrap().toString();
}

function isApiSupported(api: ApiPromise | ApiRx) {
  const isAssetsQueryUndefined = api.query?.assets?.asset === undefined;
  const isMetadataQueryUndefined = api.query?.assets?.metadata === undefined;
  const isVaultsQueryUndefined =
    api.query.multiAssetDelegation?.assetLookupRewardVaults === undefined;

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

function processAssetMetadata(
  assetId: string,
  metadata: PalletAssetsAssetMetadata,
) {
  const name = hexToString(metadata.name.toHex()) || `Asset ${assetId}`;
  const symbol = hexToString(metadata.symbol.toHex()) || `${assetId}`;
  return { name, symbol, decimals: metadata.decimals.toNumber() };
}

// Combined process function for both regular and Rx versions
function createAssetEntry(
  assetId: string,
  detail: PalletAssetsAssetDetails,
  metadata: PalletAssetsAssetMetadata,
  vaultId: Option<u128>,
  priceInUsd: number | null,
): AssetMetadata {
  const { name, symbol, decimals } = processAssetMetadata(assetId, metadata);

  return {
    id: assetId,
    name,
    symbol,
    decimals,
    status: detail.status.type,
    vaultId: u128ToVaultId(vaultId),
    priceInUsd,
    details: detail,
  } satisfies AssetMetadata;
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

// Simplified process functions
async function processAssetDetails(
  api: ApiPromise,
  nonNativeAssetIds: string[],
  assetDetails: Option<PalletAssetsAssetDetails>[],
  assetMetadatas: PalletAssetsAssetMetadata[],
  assetVaultIds: Option<u128>[],
  hasNative: boolean,
  nativeCurrency: Chain['nativeCurrency'],
) {
  const tokenPrices = await queryTokenPrices(nonNativeAssetIds, assetMetadatas);

  const initialAssetMap = hasNative
    ? {
        [(await getNativeAsset(nativeCurrency, api)).id]: await getNativeAsset(
          nativeCurrency,
          api,
        ),
      }
    : {};

  return nonNativeAssetIds.reduce((assetMap, assetId, idx) => {
    if (assetDetails[idx].isNone) {
      return assetMap;
    }

    return {
      ...assetMap,
      [assetId]: createAssetEntry(
        assetId,
        assetDetails[idx].unwrap(),
        assetMetadatas[idx],
        assetVaultIds[idx],
        typeof tokenPrices[idx] === 'number' ? tokenPrices[idx] : null,
      ),
    };
  }, initialAssetMap);
}

function processAssetDetailsRx(
  api: ApiRx,
  nonNativeAssetIds: string[],
  assetDetails: Option<PalletAssetsAssetDetails>[],
  assetMetadatas: PalletAssetsAssetMetadata[],
  assetVaultIds: Option<u128>[],
  hasNative: boolean,
  nativeCurrency: Chain['nativeCurrency'],
): Observable<AssetMap> {
  return hasNative
    ? getNativeAssetRx(nativeCurrency, api).pipe(
        map((nativeAsset) => ({ [nativeAsset.id]: nativeAsset })),
      )
    : of<AssetMap>({}).pipe(
        switchMap(async (initialAssetMap) => {
          const tokenPrices = await queryTokenPrices(
            nonNativeAssetIds,
            assetMetadatas,
          );

          return nonNativeAssetIds.reduce((assetMap, assetId, idx) => {
            if (assetDetails[idx].isNone) return assetMap;

            return {
              ...assetMap,
              [assetId]: createAssetEntry(
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

async function getNativeAsset(
  nativeCurrency: Chain['nativeCurrency'],
  api: ApiPromise,
) {
  const assetId = '0';

  const vaultId =
    await api.query.multiAssetDelegation.assetLookupRewardVaults(assetId);

  const priceInUsd = await fetchSingleTokenPrice(nativeCurrency.symbol);

  return {
    ...nativeCurrency,
    id: assetId,
    status: 'Live',
    vaultId: u128ToVaultId(vaultId),
    priceInUsd: typeof priceInUsd === 'number' ? priceInUsd : null,
  } as AssetMetadata;
}

function getNativeAssetRx(
  nativeCurrency: Chain['nativeCurrency'],
  api: ApiRx,
): Observable<AssetMetadata> {
  const assetId = '0';

  return api.query.multiAssetDelegation.assetLookupRewardVaults(assetId).pipe(
    switchMap(async (vaultId) => {
      const priceInUsd = await fetchSingleTokenPrice(nativeCurrency.symbol);

      return {
        ...nativeCurrency,
        id: assetId,
        status: 'Live' as const,
        vaultId: u128ToVaultId(vaultId),
        priceInUsd: typeof priceInUsd === 'number' ? priceInUsd : null,
      };
    }),
  );
}

// Simplified query functions
export async function assetDetailsQuery(
  api: ApiPromise,
  assetIds: string[],
  nativeCurrency: Chain['nativeCurrency'] = DEFAULT_NATIVE_CURRENCY,
) {
  const { hasNative, nonNativeAssetIds } = filterNativeAsset(assetIds);

  if (nonNativeAssetIds.length === 0 || !isApiSupported(api)) {
    return hasNative
      ? {
          [(await getNativeAsset(nativeCurrency, api)).id]:
            await getNativeAsset(nativeCurrency, api),
        }
      : {};
  }

  const [assetDetails, assetMetadatas, assetVaultIds] = await Promise.all([
    api.queryMulti<Option<PalletAssetsAssetDetails>[]>(
      nonNativeAssetIds.map(
        (assetId) => [api.query.assets.asset, assetId.toString()] as const,
      ),
    ),
    api.queryMulti<PalletAssetsAssetMetadata[]>(
      nonNativeAssetIds.map(
        (assetId) => [api.query.assets.metadata, assetId.toString()] as const,
      ),
    ),
    api.queryMulti<Option<u128>[]>(
      nonNativeAssetIds.map(
        (assetId) =>
          [
            api.query.multiAssetDelegation.assetLookupRewardVaults,
            assetId,
          ] as const,
      ),
    ),
  ]);

  return processAssetDetails(
    api,
    nonNativeAssetIds,
    assetDetails,
    assetMetadatas,
    assetVaultIds,
    hasNative,
    nativeCurrency,
  );
}

export function assetDetailsRxQuery(
  api: ApiRx,
  assetIds: string[],
  nativeCurrency: Chain['nativeCurrency'] = DEFAULT_NATIVE_CURRENCY,
) {
  const { hasNative, nonNativeAssetIds } = filterNativeAsset(assetIds);

  const isNonNativeAssetsEmpty = nonNativeAssetIds.length === 0;

  if (isNonNativeAssetsEmpty || !isApiSupported(api)) {
    if (hasNative) {
      return getNativeAssetRx(nativeCurrency, api).pipe(
        map((nativeAsset) => ({ [nativeAsset.id]: nativeAsset })),
      );
    } else {
      return of<{
        [assetId: string]: Awaited<ReturnType<typeof getNativeAsset>>;
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
          api.query.multiAssetDelegation.assetLookupRewardVaults,
          { Custom: assetId },
        ] as const,
      ]),
    [] as [
      typeof api.query.multiAssetDelegation.assetLookupRewardVaults,
      { Custom: string },
    ][],
  );

  const assetDetails$ =
    api.queryMulti<Option<PalletAssetsAssetDetails>[]>(assetDetailQueries);

  const assetMetadatas$ =
    api.queryMulti<PalletAssetsAssetMetadata[]>(assetMetadataQueries);

  const assetVaultIds$ = api.queryMulti<Option<u128>[]>(assetVaultIdQueries);

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
}
