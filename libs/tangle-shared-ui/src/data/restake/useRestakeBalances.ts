import type { ApiRx } from '@polkadot/api';
import type { Option } from '@polkadot/types';
import type { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { isTemplateBigInt } from '@tangle-network/ui-components';
import {
  EvmAddress,
  SubstrateAddress,
} from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';
import { useObservable, useObservableState } from 'observable-hooks';
import { useEffect, useMemo, useRef } from 'react';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { erc20Abi } from 'viem';
import { useReadContracts } from 'wagmi';
import useRestakeAssetIds from '../../data/restake/useRestakeAssetIds';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { RestakeAssetId } from '../../types';
import { AssetBalance, AssetBalanceMap } from '../../types/restake';
import hasAssetsPallet from '../../utils/hasAssetsPallet';
import filterNativeAsset from '../../utils/restake/filterNativeAsset';

export default function useRestakeBalances() {
  const { apiRx, apiRxLoading, apiRxError } = usePolkadotApi();
  const { assetIds } = useRestakeAssetIds();
  const activeAccount = useSubstrateAddress();

  const { substrateAssetIds, evmAssetIds: evmAssetIdsSet } = useMemo(() => {
    return assetIds.reduce(
      (acc, assetId) => {
        if (isTemplateBigInt(assetId)) {
          acc.substrateAssetIds.add(assetId);
        } else if (isEvmAddress(assetId)) {
          acc.evmAssetIds.add(assetId);
        }

        return acc;
      },
      {
        substrateAssetIds: new Set<`${bigint}`>(),
        evmAssetIds: new Set<EvmAddress>(),
      },
    );
  }, [assetIds]);

  const substrateBalances$ = useObservable(
    (input$) => input$.pipe(switchMap(substrateBalancesHandler)),
    [apiRx, substrateAssetIds, activeAccount],
  );

  const evmAssetIds = useMemo(
    () => evmAssetIdsSet.values().toArray(),
    [evmAssetIdsSet],
  );

  const {
    data: erc20Balances,
    isLoading,
    error,
    refetch: refetchErc20Balances,
  } = useErc20Balances(evmAssetIds);

  const substrateBalances = useObservableState(substrateBalances$, {});

  const balances = useMemo(() => {
    if (erc20Balances === undefined) {
      return substrateBalances;
    }

    const erc20BalancesMap = erc20Balances.reduce(
      (acc, balance, idx) => {
        if (
          balance.status === 'success' &&
          typeof balance.result === 'bigint'
        ) {
          const id = evmAssetIds[idx];
          acc[id] = {
            assetId: id,
            balance: balance.result,
          };
        }

        return acc;
      },
      {} as Record<RestakeAssetId, AssetBalance>,
    );

    return merge(erc20BalancesMap, substrateBalances);
  }, [erc20Balances, evmAssetIds, substrateBalances]);

  return {
    balances,
    isLoading: apiRxLoading || isLoading,
    error: apiRxError || error,
    refetchErc20Balances,
  };
}

function substrateBalancesHandler([apiRx, assetIdSet, activeAccount]: [
  ApiRx,
  Set<`${bigint}`>,
  SubstrateAddress | null,
]) {
  const emptyObservable = of<AssetBalanceMap>({});

  if (!hasAssetsPallet(apiRx, 'query', 'account')) {
    return emptyObservable;
  } else if (activeAccount === null || activeAccount.length === 0) {
    return emptyObservable;
  }

  const { hasNative, nonNativeAssetIds } = filterNativeAsset(
    assetIdSet.values().toArray(),
  );

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
    apiRx.queryMulti<Option<PalletAssetsAssetAccount>[]>(batchedQueries);

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
}

function assetBalancesReducer(
  assetBalances: Option<PalletAssetsAssetAccount>[],
  initialValue: AssetBalanceMap,
  assetIds: RestakeAssetId[],
) {
  return assetBalances.reduce(
    (assetBalanceMap, accountBalance, idx) => {
      if (accountBalance.isNone) {
        return assetBalanceMap;
      }

      const { balance } = accountBalance.unwrap();
      const assetId = assetIds[idx];

      return Object.assign(assetBalanceMap, {
        [assetId]: {
          assetId,
          balance: balance.toBigInt(),
        },
      } satisfies AssetBalanceMap);
    },
    // Clone the initial value to avoid mutation
    { ...initialValue },
  );
}

/** @internal */
function getNativeBalance$(apiRx: ApiRx, activeAccount: string) {
  return apiRx.query.system.account(activeAccount).pipe(
    map(
      ({ data }) =>
        ({
          '0': {
            assetId: '0',
            balance: data.free.toBigInt(),
          },
        }) as AssetBalanceMap,
    ),
  );
}

function useErc20Balances(assetAddressesArg: Array<EvmAddress>) {
  const { evmAddress } = useAgnosticAccountInfo();

  const assetAddresses = useRef(assetAddressesArg);

  // Shallow compare the asset addresses
  useEffect(() => {
    if (!isEqual(assetAddresses.current, assetAddressesArg)) {
      assetAddresses.current = assetAddressesArg;
    }
  }, [assetAddressesArg]);

  const contracts = useMemo(() => {
    if (evmAddress === null) {
      return [];
    }

    return assetAddresses.current.map((address) => ({
      address,
      abi: erc20Abi,
      functionName: 'balanceOf' as const,
      args: [evmAddress] as const,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evmAddress, assetAddresses.current]);

  return useReadContracts({
    contracts: contracts,
    query: {
      enabled: evmAddress !== null,
    },
  });
}
