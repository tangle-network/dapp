import { ApiPromise, ApiRx } from '@polkadot/api';
import type { Option, u32 } from '@polkadot/types';
import type {
  PalletAssetsAssetDetails,
  PalletAssetsAssetMetadata,
  PalletAssetsAssetStatus,
} from '@polkadot/types/lookup';
import { BN, formatBalance, hexToString } from '@polkadot/util';
import type { Chain } from '@webb-tools/dapp-config';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { RestakeVaultMap, RestakeVaultMetadata } from '../../types/restake';
import filterNativeAsset from '../../utils/restake/filterNativeAsset';
import { fetchTokenPriceBySymbol } from '../../utils/fetchTokenPrices';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import { RestakeAssetId } from '../../utils/createRestakeAssetId';
import createAssetIdEnum from '../../utils/createAssetIdEnum';
import { assertEvmAddress, isEvmAddress } from '@webb-tools/webb-ui-components';

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
  metadata: PalletAssetsAssetMetadata,
  vaultId: Option<u32>,
  priceInUsd: number | null,
  status?: PalletAssetsAssetStatus['type'],
): RestakeVaultMetadata {
  const name = hexToString(metadata.name.toHex()) || `Asset ${assetId}`;
  const symbol = hexToString(metadata.symbol.toHex()) || `${assetId}`;
  const decimals = metadata.decimals.toNumber();

  return {
    assetId: assertRestakeAssetId(assetId),
    name,
    symbol,
    decimals,
    status,
    vaultId: createVaultId(vaultId),
    priceInUsd,
  } satisfies RestakeVaultMetadata;
}

function processAssetDetailsRx(
  api: ApiRx,
  nonNativeAssetIds: RestakeAssetId[],
  assetDetails: Option<PalletAssetsAssetDetails>[],
  assetMetadatas: PalletAssetsAssetMetadata[],
  assetVaultIds: Option<u32>[],
  hasNative: boolean,
  nativeCurrency: Chain['nativeCurrency'],
): Observable<RestakeVaultMap> {
  return hasNative
    ? getNativeAssetRx(nativeCurrency, api).pipe(
        map((nativeAsset) => ({ [nativeAsset.assetId]: nativeAsset })),
      )
    : of<RestakeVaultMap>({}).pipe(
        switchMap(async (initialAssetMap) => {
          return nonNativeAssetIds.reduce((assetMap, assetId, idx) => {
            // TODO: Implement price fetching.
            // const price = await fetchTokenPriceBySymbol(erc20Token.symbol);
            const price = null;

            if (isEvmAddress(assetId)) {
              const erc20Token = {
                name: "Yuri's Local ERC-2 Dummy",
                symbol: 'USDC',
                decimals: 18,
                contractAddress: assertEvmAddress(
                  '0x2af9b184d0d42cd8d3c4fd0c953a06b6838c9357',
                ),
              };

              if (erc20Token === null) {
                return assetMap;
              }

              return {
                ...assetMap,
                [assetId]: {
                  assetId,
                  name: erc20Token.name,
                  symbol: erc20Token.symbol,
                  decimals: erc20Token.decimals,
                  status: 'Live' as const,
                  vaultId: assetVaultIds[idx].unwrap().toNumber(),
                  priceInUsd: price,
                } satisfies RestakeVaultMetadata,
              };
            } else if (
              assetDetails[idx] === undefined ||
              assetDetails[idx].isNone
            ) {
              return assetMap;
            }

            return {
              ...assetMap,
              [assetId]: createAssetMetadata(
                assetId,
                assetMetadatas[idx],
                assetVaultIds[idx],
                price,
                assetDetails[idx].unwrap().status.type,
              ),
            };
          }, initialAssetMap);
        }),
      );
}

function getNativeAssetRx(
  nativeCurrency: Chain['nativeCurrency'],
  api: ApiRx,
): Observable<RestakeVaultMetadata> {
  const assetId = 0;

  return api.query.rewards.assetLookupRewardVaults({ Custom: assetId }).pipe(
    switchMap(async (vaultId) => {
      const priceInUsd = await fetchTokenPriceBySymbol(nativeCurrency.symbol);

      return {
        ...nativeCurrency,
        assetId: `${assetId}`,
        status: 'Live' as const,
        vaultId: createVaultId(vaultId),
        priceInUsd: typeof priceInUsd === 'number' ? priceInUsd : null,
      } satisfies RestakeVaultMetadata;
    }),
  );
}

export const queryVaultsRx = (
  api: ApiRx,
  assetIds: RestakeAssetId[],
  nativeCurrency: Chain['nativeCurrency'] = DEFAULT_NATIVE_CURRENCY,
) => {
  const { hasNative, nonNativeAssetIds } = filterNativeAsset(assetIds);
  const isNonNativeAssetsEmpty = nonNativeAssetIds.length === 0;

  if (isNonNativeAssetsEmpty || !isApiSupported(api)) {
    if (hasNative) {
      return getNativeAssetRx(nativeCurrency, api).pipe(
        map((nativeAsset) => ({ [nativeAsset.assetId]: nativeAsset })),
      );
    } else {
      return of<{
        [assetId: RestakeAssetId]: RestakeVaultMetadata;
      }>({});
    }
  }

  // Batch queries for asset details
  const assetDetailQueries = nonNativeAssetIds.reduce(
    (batchQueries, assetId) => {
      if (isEvmAddress(assetId)) {
        return batchQueries;
      }

      return batchQueries.concat([[api.query.assets.asset, new BN(assetId)]]);
    },
    [] as [typeof api.query.assets.asset, BN][],
  );

  type MetadataBatchQueries = [
    typeof api.query.assets.metadata,
    Parameters<typeof api.query.assets.metadata>[0],
  ][];

  // Batch queries for asset metadata
  const assetMetadataQueries = nonNativeAssetIds.reduce(
    (batchQueries: MetadataBatchQueries, assetId) => {
      if (isEvmAddress(assetId)) {
        return batchQueries;
      }

      return batchQueries.concat([[api.query.assets.metadata, assetId]]);
    },
    [],
  );

  type VaultIdQueries = [
    typeof api.query.rewards.assetLookupRewardVaults,
    Parameters<typeof api.query.rewards.assetLookupRewardVaults>[0],
  ][];

  // Batch queries for asset vault ID
  const assetVaultIdQueries = nonNativeAssetIds.reduce(
    (batchQueries: VaultIdQueries, assetId) =>
      batchQueries.concat([
        [api.query.rewards.assetLookupRewardVaults, createAssetIdEnum(assetId)],
      ]),
    [],
  );

  const assetDetails$ =
    api.queryMulti<Option<PalletAssetsAssetDetails>[]>(assetDetailQueries);

  const assetMetadatas$ =
    api.queryMulti<PalletAssetsAssetMetadata[]>(assetMetadataQueries);

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
