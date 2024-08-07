'use client';

import type { ApiRx } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { useObservable, useObservableState } from 'observable-hooks';
import { combineLatest, map, of, switchMap } from 'rxjs';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import type { AssetBalance, AssetBalanceMap } from '../../types/restake';
import hasAssetsPallet from '../../utils/hasAssetsPallet';
import filterNativeAsset from '../../utils/restaking/filterNativeAsset';
import useRestakeAssetIds from './useRestakeAssetIds';

export default function useRestakeBalances() {
  const { apiRx } = usePolkadotApi();
  const { assetIds } = useRestakeAssetIds();
  const activeAccount = useSubstrateAddress();

  const balances$ = useObservable(
    (input$) =>
      input$.pipe(
        switchMap(([apiRx, assetIds, activeAccount]) => {
          const emptyObservable = of<AssetBalanceMap>({});

          if (!hasAssetsPallet(apiRx, 'query', 'account')) {
            return emptyObservable;
          }

          if (activeAccount === null || activeAccount.length === 0) {
            return emptyObservable;
          }

          const { hasNative, nonNativeAssetIds } = filterNativeAsset(assetIds);
          if (nonNativeAssetIds.length === 0) {
            return hasNative
              ? getNativeBalance$(apiRx, activeAccount)
              : emptyObservable;
          }

          // non-native assets is not empty
          const batchedQueries = nonNativeAssetIds.map<
            [typeof apiRx.query.assets.account, [string, string]]
          >((assetId) => [
            apiRx.query.assets.account,
            [assetId.toString(), activeAccount],
          ]);

          const result$ =
            apiRx.queryMulti<Option<PalletAssetsAssetAccount>[]>(
              batchedQueries,
            );

          if (hasNative) {
            return combineLatest([
              result$,
              getNativeBalance$(apiRx, activeAccount),
            ]).pipe(
              map(([assetAccountBalances, nativeBalance]) => {
                return assetBalancesReducer(
                  assetAccountBalances,
                  nativeBalance,
                  nonNativeAssetIds,
                );
              }),
            );
          } else {
            return result$.pipe(
              map((assetAccountBalances) => {
                return assetBalancesReducer(
                  assetAccountBalances,
                  {},
                  nonNativeAssetIds,
                );
              }),
            );
          }
        }),
      ),
    [apiRx, assetIds, activeAccount],
  );

  const balances = useObservableState(balances$, {});

  return {
    balances,
    balances$,
  };
}

function assetBalancesReducer(
  assetBalances: Option<PalletAssetsAssetAccount>[],
  initialValue: AssetBalanceMap,
  nonNativeAssetIds: string[],
) {
  return assetBalances.reduce(
    (assetBalanceMap, accountBalance, idx) => {
      if (accountBalance.isNone) {
        return assetBalanceMap;
      }

      const { balance, status, reason } = accountBalance.unwrap();

      const assetId = nonNativeAssetIds[idx];

      function toPrimitiveReason(
        reasonArg: typeof reason,
      ): AssetBalance['existenceReason'] {
        if (reasonArg.type === 'DepositHeld') {
          return {
            DepositHeld: reasonArg.asDepositHeld.toString(),
          };
        }

        if (reasonArg.type === 'DepositFrom') {
          return {
            DepositFrom: reasonArg.asDepositFrom,
          };
        }

        return reasonArg.type;
      }

      return Object.assign(assetBalanceMap, {
        [assetId]: {
          assetId: assetId,
          balance: balance.toBigInt(),
          status: status.type,
          existenceReason: toPrimitiveReason(reason),
        },
      } satisfies AssetBalanceMap);
    },
    // Clone the initial value to avoid mutation
    { ...initialValue },
  );
}

/**
 * @internal
 * Get the native balance observable.
 */
function getNativeBalance$(apiRx: ApiRx, activeAccount: string) {
  return apiRx.query.system.account(activeAccount).pipe(
    map(
      ({ data }) =>
        ({
          '0': {
            assetId: '0',
            balance: data.free.toBigInt(),
            status: 'Liquid',
            existenceReason: 'Sufficient',
          },
        }) as AssetBalanceMap,
    ),
  );
}
