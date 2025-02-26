import { isTemplateBigInt } from '@tangle-network/ui-components';
import { EvmAddress } from '@tangle-network/ui-components/types/address';
import { isEvmAddress } from '@tangle-network/ui-components/utils/isEvmAddress20';
import merge from 'lodash/merge';
import { useMemo } from 'react';
import useRestakeAssetIds from './useRestakeAssetIds';
import { RestakeAssetId } from '../../types';
import { AssetBalance } from '../../types/restake';
import useErc20Balances from './useErc20Balances';

const useRestakeAssetBalances = () => {
  const assetIds = useRestakeAssetIds();

  const { evmAssetIds: evmAssetIdsSet } = useMemo(() => {
    if (assetIds === null) {
      return {
        substrateAssetIds: new Set<`${bigint}`>(),
        evmAssetIds: new Set<EvmAddress>(),
      };
    }

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
      {} satisfies Record<RestakeAssetId, AssetBalance> as Record<
        RestakeAssetId,
        AssetBalance
      >,
    );

    return merge(erc20BalancesMap, substrateBalances);
  }, [erc20Balances, evmAssetIds, substrateBalances]);

  return {
    balances,
    refetchErc20Balances,
  };
};

export default useRestakeAssetBalances;
