import { BN } from '@polkadot/util';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  DelegatorInfo,
  OperatorMetadata,
} from '@tangle-network/tangle-shared-ui/types/restake';
import { ComponentProps, useMemo } from 'react';
import VaultAssetsTable from '@tangle-network/tangle-shared-ui/components/tables/VaultAssets';
import { VaultAssetData } from '@tangle-network/tangle-shared-ui/components/tables/VaultAssets/types';
import VaultsTable from '../components/tables/Vaults';
import useRestakeRewardConfig from '@tangle-network/tangle-shared-ui/hooks/useRestakeRewardConfig';
import createVaultMap from '@tangle-network/tangle-shared-ui/utils/createVaultMap';
import useVaultRewards from '@tangle-network/tangle-shared-ui/data/rewards/useVaultRewards';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';

type Options = {
  operatorData?: OperatorMetadata;
  delegatorInfo: DelegatorInfo | null;
};

const useVaultTableData = ({ operatorData, delegatorInfo }: Options) => {
  const rewardConfig = useRestakeRewardConfig();
  const assetsTvl = useRestakeAssetsTvl();
  const assetTvl = useRestakeAssetsTvl();
  const { assets, isLoading: isLoadingAssets } = useRestakeAssets();
  const { result: vaultsRewards, isLoading: isLoadingVaultsRewards } =
    useVaultRewards();

  const vaults = useMemo(() => {
    if (assets === null) {
      return null;
    }
    // Handle all vaults.
    else if (operatorData === undefined) {
      return createVaultMap({
        assets: Array.from(assets.values()),
        rewardConfig,
        delegatorInfo,
        vaultsRewards,
        assetTvl,
      })
        .values()
        .toArray();
    }

    // Handle operator-specific vaults.
    const uniqueAssetIds = operatorData.delegations.reduce(
      (acc, { assetId }) => {
        acc.add(assetId);

        return acc;
      },
      new Set<RestakeAssetId>(),
    );

    const operatorAssets = Array.from(uniqueAssetIds)
      .map((assetId) => assets.get(assetId))
      .filter((asset) => asset !== undefined);

    return createVaultMap({
      assets: operatorAssets,
      rewardConfig,
      delegatorInfo,
      vaultsRewards,
      assetTvl,
    })
      .values()
      .toArray();
  }, [
    assetTvl,
    assets,
    delegatorInfo,
    operatorData,
    rewardConfig,
    vaultsRewards,
  ]);

  const tableProps = useMemo<ComponentProps<typeof VaultsTable>['tableProps']>(
    () => ({
      onRowClick(row, table) {
        if (!row.getCanExpand()) {
          return;
        }

        // Close all other rows.
        table.getRowModel().rows.forEach((row_) => {
          if (row_.id !== row.id && row_.getIsExpanded()) {
            row_.toggleExpanded(false);
          }
        });

        return row.toggleExpanded();
      },
      getExpandedRowContent(row) {
        if (assets === null) {
          return;
        }

        const vaultId = row.original.id;

        const vaultAssets = Array.from(assets.values())
          .filter((asset) => asset.metadata.vaultId === vaultId)
          .map(
            ({
              id: assetId,
              metadata: { decimals, symbol, name },
              balance,
            }) => {
              const tvl = assetsTvl?.get(assetId) ?? null;
              const available = balance ?? null;

              const totalDeposits =
                typeof delegatorInfo?.deposits[assetId]?.amount === 'bigint'
                  ? new BN(delegatorInfo.deposits[assetId].amount.toString())
                  : null;

              return {
                id: assetId,
                name,
                symbol,
                decimals,
                tvl,
                available,
                totalDeposits,
              } satisfies VaultAssetData;
            },
          );

        return (
          <VaultAssetsTable
            isShown={row.getIsExpanded()}
            data={vaultAssets}
            depositCapacity={row.original.capacity}
            tvl={row.original.tvl}
            decimals={row.original.decimals}
          />
        );
      },
    }),
    [assets, assetsTvl, delegatorInfo?.deposits],
  );

  return {
    vaults,
    tableProps,
    isLoading: isLoadingAssets || isLoadingVaultsRewards,
  };
};

export default useVaultTableData;
