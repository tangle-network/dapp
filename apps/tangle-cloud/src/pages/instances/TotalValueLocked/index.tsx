import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { LockFillIcon } from '@tangle-network/icons';
import { ReactElement, useMemo, useState } from 'react';
import { TabContent, toSubstrateAddress } from '@tangle-network/ui-components';
import { TotalValueLockedTable } from './TotalValueLockedTable';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeRewardConfig from '@tangle-network/tangle-shared-ui/hooks/useRestakeRewardConfig';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import useVaultRewards from '@tangle-network/tangle-shared-ui/data/rewards/useVaultRewards';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import { BN } from '@polkadot/util';
import VaultAssetsTable from '@tangle-network/tangle-shared-ui/components/tables/VaultAssets';
import { VaultAssetData } from '@tangle-network/tangle-shared-ui/components/tables/VaultAssets/types';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import createVaultMap from '@tangle-network/tangle-shared-ui/utils/createVaultMap';

enum TotalValueLockedTab {
  TVL = 'Total Value Locked',
}

const TotalValueLockedTabIcon: ReactElement[] = [
  <LockFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export const TotalValueLockedTabs = () => {
  const [selectedTab, setSelectedTab] = useState(TotalValueLockedTab.TVL);

  const { assets } = useRestakeAssets();
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const address = useActiveAccountAddress();
  const { operatorMap } = useRestakeOperatorMap();
  const rewardConfig = useRestakeRewardConfig();
  const { result: vaultsRewards } = useVaultRewards();
  const assetTvl = useRestakeAssetsTvl();

  const operatorData = useMemo(() => {
    if (!address) {
      return undefined;
    }
    return operatorMap[toSubstrateAddress(address)];
  }, [operatorMap, address]);

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

  return (
    <TableAndChartTabs
      tabs={Object.values(TotalValueLockedTab)}
      icons={TotalValueLockedTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as TotalValueLockedTab)}
      className="space-y-9 w-full"
      triggerClassName=""
      enableAdvancedDivider
    >
      <TabContent
        value={TotalValueLockedTab.TVL}
        className="flex justify-center mx-auto"
      >
        <TotalValueLockedTable
          data={vaults ?? []}
          isLoading={vaults === null}
          error={null}
          tableConfig={{
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
              if (assets === null) {
                return;
              }

              const vaultId = row.original.id;

              const vaultAssets = Array.from(assets.values())
                .filter((asset) => asset.metadata.vaultId === vaultId)
                .map(
                  ({
                    id: assetId,
                    metadata: { decimals, symbol },
                    balance,
                  }) => {
                    const tvl = assetTvl?.get(assetId) ?? null;
                    const available = balance ?? null;

                    const totalDeposits =
                      typeof delegatorInfo?.deposits[assetId]?.amount ===
                      'bigint'
                        ? new BN(
                            delegatorInfo.deposits[assetId].amount.toString(),
                          )
                        : null;

                    return {
                      id: assetId,
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
                />
              );
            },
          }}
        />
      </TabContent>
    </TableAndChartTabs>
  );
};
