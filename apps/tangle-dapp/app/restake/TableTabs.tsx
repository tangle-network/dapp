'use client';

import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';
import { type ComponentProps, useMemo } from 'react';

import VaultAssetsTable from '../../components/tables/VaultAssets';
import VaultsTable from '../../components/tables/Vaults';
import { useRestakeContext } from '../../context/RestakeContext';
import OperatorsTable from './OperatorsTable';

const RESTAKE_VAULTS_TAB = 'Restake Vaults';

const OPERATORS_TAB = 'Operators';

type VaultUI = NonNullable<ComponentProps<typeof VaultsTable>['data']>[number];

type VaultAssetUI = NonNullable<
  ComponentProps<typeof VaultAssetsTable>['data']
>[number];

const TableTabs = () => {
  const { assetMap } = useRestakeContext();

  // Recalculate vaults (pools) data from assetMap
  const vaults = useMemo(() => {
    const vaults: Record<string, VaultUI> = {};

    for (const { poolId, name, symbol } of Object.values(assetMap)) {
      if (poolId === null) continue;

      if (vaults[poolId] === undefined) {
        vaults[poolId] = {
          id: poolId,
          // TODO: Calculate APY
          apyPercentage: 0,
          // TODO: Find out a proper way to get the pool name, now it's the first token name
          name: name,
          // TODO: Find out a proper way to get the pool symbol, now it's the first token symbol
          representToken: symbol,
          tokensCount: 1,
          // TODO: Calculate tvl in USD
          tvlInUsd: 0,
        };
      } else {
        vaults[poolId].tokensCount += 1;
      }
    }

    return vaults;
  }, [assetMap]);

  const tableProps = useMemo<ComponentProps<typeof VaultsTable>['tableProps']>(
    () => ({
      onRowClick(row) {
        if (!row.getCanExpand()) return;
        return row.toggleExpanded();
      },
      getExpandedRowContent(row) {
        const poolId = row.original.id;
        const vaultAssets = Object.values(assetMap)
          .filter((asset) => asset.poolId === poolId)
          .map(
            (asset) =>
              ({
                id: asset.id,
                symbol: asset.symbol,
                // TODO: Calculate tvl
                tvl: 0,
                // TODO: Calculate self stake
                selfStake: 0,
              }) satisfies VaultAssetUI,
          );

        return (
          <div className="px-3 pt-4 pb-3 -mx-px bg-mono-0 dark:bg-mono-190 -mt-7 rounded-b-xl">
            <VaultAssetsTable
              isShown={row.getIsExpanded()}
              data={vaultAssets}
            />
          </div>
        );
      },
    }),
    [assetMap],
  );

  return (
    <TableAndChartTabs
      tabs={[RESTAKE_VAULTS_TAB, OPERATORS_TAB]}
      headerClassName="w-full"
    >
      <TabContent value={RESTAKE_VAULTS_TAB}>
        <VaultsTable data={Object.values(vaults)} tableProps={tableProps} />
      </TabContent>

      <TabContent value={OPERATORS_TAB}>
        <OperatorsTable />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default TableTabs;
