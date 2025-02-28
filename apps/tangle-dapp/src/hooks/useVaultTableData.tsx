import { BN } from '@polkadot/util';
import { useRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  DelegatorInfo,
  OperatorMetadata,
} from '@tangle-network/tangle-shared-ui/types/restake';
import { ComponentProps, useMemo } from 'react';
import VaultAssetsTable from '../components/tables/VaultAssets';
import { VaultAssetData } from '../components/tables/VaultAssets/types';
import VaultsTable from '../components/tables/Vaults';
import useRestakeRewardConfig from '@tangle-network/tangle-shared-ui/hooks/useRestakeRewardConfig';
import calculateVaults from '@tangle-network/ui-components/utils/calculateVaults';
import useVaultRewards from '@tangle-network/tangle-shared-ui/data/rewards/useVaultRewards';

type UseVaultTableDataParams = {
  operatorData?: OperatorMetadata;
  delegatorInfo: DelegatorInfo | null;
};

const useVaultTableData = ({
  operatorData,
  delegatorInfo,
}: UseVaultTableDataParams) => {
  const { assets, balances } = useRestakeContext();
  const rewardConfig = useRestakeRewardConfig();
  const assetsTvl = useRestakeAssetsTvl();
  const { result: vaultsRewards } = useVaultRewards();
  const assetTvl = useRestakeAssetsTvl();

  const vaults = useMemo(
    () => {
      if (operatorData) {
        // Handle operator-specific vaults
        const uniqueAssetIds = operatorData.delegations.reduce(
          (acc, { assetId }) => {
            acc.add(assetId);
            return acc;
          },
          new Set<RestakeAssetId>(),
        );

        const operatorAssets = Array.from(uniqueAssetIds)
          .map((assetId) => assets[assetId])
          .filter((asset) => asset !== undefined);

        return calculateVaults({
          assets: operatorAssets,
          rewardConfig,
          balances,
          delegatorInfo,
          vaultsRewards,
          assetTvl,
        })
          .values()
          .toArray();
      }

      // Handle all vaults
      return calculateVaults({
        assets: Object.values(assets),
        rewardConfig,
        balances,
        delegatorInfo,
        vaultsRewards,
        assetTvl,
      })
        .values()
        .toArray();
    },
    // prettier-ignore
    [assetTvl, assets, balances, delegatorInfo, operatorData, rewardConfig, vaultsRewards],
  );

  const tableProps = useMemo<ComponentProps<typeof VaultsTable>['tableProps']>(
    () => ({
      onRowClick(row, table) {
        if (!row.getCanExpand()) return;

        // Close all other rows
        table.getRowModel().rows.forEach((r) => {
          if (r.id !== row.id && r.getIsExpanded()) {
            r.toggleExpanded(false);
          }
        });

        return row.toggleExpanded();
      },
      getExpandedRowContent(row) {
        const vaultId = row.original.id;
        const vaultAssets = Object.values(assets)
          .filter((asset) => asset.vaultId === vaultId)
          .map(({ assetId, decimals, symbol }) => {
            const tvl = assetsTvl?.get(assetId) ?? null;
            const available = balances[assetId]
              ? new BN(balances[assetId].balance.toString())
              : null;

            const totalDeposits =
              typeof delegatorInfo?.deposits[assetId]?.amount === 'bigint'
                ? new BN(delegatorInfo.deposits[assetId].amount.toString())
                : null;

            return {
              id: assetId,
              symbol,
              decimals,
              tvl,
              available,
              totalDeposits,
            } satisfies VaultAssetData;
          });

        return (
          <VaultAssetsTable isShown={row.getIsExpanded()} data={vaultAssets} />
        );
      },
    }),
    [assets, assetsTvl, balances, delegatorInfo?.deposits],
  );

  return {
    vaults,
    tableProps,
  };
};

export default useVaultTableData;
