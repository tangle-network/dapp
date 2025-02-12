import { ApiPromise, ApiRx } from '@polkadot/api';
import type { Option, u32 } from '@polkadot/types';
import type {
  PalletAssetsAssetDetails,
  PalletAssetsAssetMetadata,
  PalletAssetsAssetStatus,
} from '@polkadot/types/lookup';
import { BN, formatBalance, hexToString } from '@polkadot/util';
import type { Chain } from '@webb-tools/dapp-config';
import { EvmAddress } from '@webb-tools/webb-ui-components/types/address';
import { isEvmAddress } from '@webb-tools/webb-ui-components/utils/isEvmAddress20';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';
import { PublicClient } from 'viem';
import { findErc20Token } from '../../hooks/useTangleEvmErc20Balances';
import { RestakeAssetId } from '../../types';
import { RestakeAssetMap, RestakeAssetMetadata } from '../../types/restake';
import assertRestakeAssetId from '../../utils/assertRestakeAssetId';
import createAssetIdEnum from '../../utils/createAssetIdEnum';
import fetchErc20TokenMetadata from '../../utils/fetchErc20TokenMetadata';
import { fetchTokenPriceBySymbol } from '../../utils/fetchTokenPrices';
import filterNativeAsset from '../../utils/restake/filterNativeAsset';

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
  vaultId: number | null,
  priceInUsd: number | null,
  status?: PalletAssetsAssetStatus['type'],
): RestakeAssetMetadata {
  const name = hexToString(metadata.name.toHex()) || `Asset ${assetId}`;
  const symbol = hexToString(metadata.symbol.toHex()) || `${assetId}`;
  const decimals = metadata.decimals.toNumber();

  return {
    assetId: assertRestakeAssetId(assetId),
    name,
    symbol,
    decimals,
    status,
    vaultId,
    priceInUsd,
  } satisfies RestakeAssetMetadata;
}

function processAssetDetailsRx(
  api: ApiRx,
  substrateAssetIds: Set<`${bigint}`>,
  evmAssetIds: Set<EvmAddress>,
  assetDetails: Option<PalletAssetsAssetDetails>[],
  assetMetadatas: PalletAssetsAssetMetadata[],
  assetVaultMap: Map<RestakeAssetId, number>,
  hasNative: boolean,
  nativeCurrency: Chain['nativeCurrency'],
  viemPublicClient?: PublicClient | undefined | null,
): Observable<RestakeAssetMap> {
  return hasNative
    ? getNativeAssetRx(nativeCurrency, api).pipe(
        map((nativeAsset) => ({ [nativeAsset.assetId]: nativeAsset })),
      )
    : of<RestakeAssetMap>({}).pipe(
        switchMap(async (initialAssetMap) => {
          const substrateAssetMap = substrateAssetIds
            .values()
            .reduce((assetMap, assetId, idx) => {
              // TODO: Implement price fetching.
              // const price = await fetchTokenPriceBySymbol(erc20Token.symbol);
              const price = null;

              if (assetDetails[idx] === undefined || assetDetails[idx].isNone) {
                return assetMap;
              }

              return {
                ...assetMap,
                [assetId]: createAssetMetadata(
                  assetId,
                  assetMetadatas[idx],
                  assetVaultMap.get(assetId) ?? null,
                  price,
                  assetDetails[idx].unwrap().status.type,
                ),
              };
            }, initialAssetMap);

          const evmAssetMap = await evmAssetIds.values().reduce(
            async (assetMap, assetId) => {
              // TODO: Implement price fetching.
              // const price = await fetchTokenPriceBySymbol(erc20Token.symbol);
              const price = null;

              const erc20Token = findErc20Token(assetId);

              if (erc20Token === null) {
                if (!viemPublicClient) {
                  return assetMap;
                }

                const metadata = await fetchErc20TokenMetadata(
                  viemPublicClient,
                  assetId,
                );

                if (metadata === null) {
                  return assetMap;
                }

                return {
                  ...(await assetMap),
                  [assetId]: {
                    assetId,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    decimals: metadata.decimals,
                    status: 'Live' as const,
                    vaultId: assetVaultMap.get(assetId) ?? null,
                    priceInUsd: price,
                  } satisfies RestakeAssetMetadata,
                };
              }

              return {
                ...(await assetMap),
                [assetId]: {
                  assetId,
                  name: erc20Token.name,
                  symbol: erc20Token.symbol,
                  decimals: erc20Token.decimals,
                  status: 'Live' as const,
                  vaultId: assetVaultMap.get(assetId) ?? null,
                  priceInUsd: price,
                } satisfies RestakeAssetMetadata,
              };
            },
            Promise.resolve({} as RestakeAssetMap),
          );

          return {
            ...substrateAssetMap,
            ...evmAssetMap,
          };
        }),
      );
}

function getNativeAssetRx(
  nativeCurrency: Chain['nativeCurrency'],
  api: ApiRx,
): Observable<RestakeAssetMetadata> {
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
      } satisfies RestakeAssetMetadata;
    }),
  );
}

export const queryAssetsRx = (
  api: ApiRx,
  assetIds: RestakeAssetId[],
  nativeCurrency: Chain['nativeCurrency'] = DEFAULT_NATIVE_CURRENCY,
  viemPublicClient?: PublicClient | undefined | null,
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
        [assetId: RestakeAssetId]: RestakeAssetMetadata;
      }>({});
    }
  }

  const { substrateAssetIds, evmAssetIds } = nonNativeAssetIds.reduce(
    ({ substrateAssetIds, evmAssetIds }, assetId) => {
      if (isEvmAddress(assetId)) {
        evmAssetIds.add(assetId);
      } else {
        substrateAssetIds.add(assetId);
      }

      return { substrateAssetIds, evmAssetIds };
    },
    {
      substrateAssetIds: new Set<`${bigint}`>(),
      evmAssetIds: new Set<EvmAddress>(),
    },
  );

  // Batch queries for asset details
  const assetDetailQueries = substrateAssetIds.values().reduce(
    (batchQueries, assetId) => {
      return batchQueries.concat([[api.query.assets.asset, new BN(assetId)]]);
    },
    [] as [typeof api.query.assets.asset, BN][],
  );

  type MetadataBatchQueries = [
    typeof api.query.assets.metadata,
    Parameters<typeof api.query.assets.metadata>[0],
  ][];

  // Batch queries for asset metadata
  const assetMetadataQueries = substrateAssetIds
    .values()
    .reduce((batchQueries: MetadataBatchQueries, assetId) => {
      return batchQueries.concat([[api.query.assets.metadata, assetId]]);
    }, []);

  type VaultIdQueries = [
    typeof api.query.rewards.assetLookupRewardVaults,
    Parameters<typeof api.query.rewards.assetLookupRewardVaults>[0],
  ][];

  // Batch queries for asset vault ID
  const assetVaultIdQueries = nonNativeAssetIds
    .values()
    .reduce(
      (batchQueries: VaultIdQueries, assetId) =>
        batchQueries.concat([
          [
            api.query.rewards.assetLookupRewardVaults,
            createAssetIdEnum(assetId),
          ],
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
      const assetVaultMap = assetVaultIds.reduce((assetMap, vaultId, idx) => {
        if (vaultId.isNone) {
          return assetMap;
        }

        return assetMap.set(
          nonNativeAssetIds[idx],
          vaultId.unwrap().toNumber(),
        );
      }, new Map<RestakeAssetId, number>());

      return processAssetDetailsRx(
        api,
        substrateAssetIds,
        evmAssetIds,
        assetDetails,
        assetMetadatas,
        assetVaultMap,
        hasNative,
        nativeCurrency,
        viemPublicClient,
      );
    }),
  );
};
