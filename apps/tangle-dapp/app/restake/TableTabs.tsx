'use client';

import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';
import { type ComponentProps, type FC, useMemo } from 'react';
import { formatUnits } from 'viem';

import VaultAssetsTable from '../../components/tables/VaultAssets';
import VaultsTable from '../../components/tables/Vaults';
import { useRestakeContext } from '../../context/RestakeContext';
import useRestakeRewardConfig from '../../data/restake/useRestakeRewardConfig';
import type { DelegatorInfo, OperatorMap } from '../../types/restake';
import OperatorsTable from './OperatorsTable';

const RESTAKE_VAULTS_TAB = 'Restake Vaults';

const OPERATORS_TAB = 'Operators';

type VaultUI = NonNullable<ComponentProps<typeof VaultsTable>['data']>[number];

type VaultAssetUI = NonNullable<
  ComponentProps<typeof VaultAssetsTable>['data']
>[number];

type Props = {
  operatorMap: OperatorMap,
  delegatorInfo: DelegatorInfo | null,
  delegatorTVL?: Record<string, number>,
  operatorTVL?: Record<string, number>,
  vaultTVL?: Record<string, number>,
}

const TableTabs: FC<Props> = ({
  delegatorInfo,
  delegatorTVL,
  operatorMap,
  operatorTVL,
  vaultTVL
}) => {
  const { assetMap } = useRestakeContext();

  const { rewardConfig } = useRestakeRewardConfig();

  // Recalculate vaults (pools) data from assetMap
  const vaults = useMemo(() => {
    const vaults: Record<string, VaultUI> = {};

    for (const { poolId, name, symbol } of Object.values(assetMap)) {
      if (poolId === null) continue;

      if (vaults[poolId] === undefined) {
        const apyPercentage = rewardConfig.configs[poolId]?.apy ?? 0
        const tvlInUsd = vaultTVL?.[poolId] ?? Number.NaN;

        vaults[poolId] = {
          id: poolId,
          apyPercentage,
          // TODO: Find out a proper way to get the pool name, now it's the first token name
          name: name,
          // TODO: Find out a proper way to get the pool symbol, now it's the first token symbol
          representToken: symbol,
          tokensCount: 1,
          tvlInUsd,
        };
      } else {
        vaults[poolId].tokensCount += 1;
      }
    }

    return vaults;
  }, [assetMap, rewardConfig.configs, vaultTVL]);

  const delegatorTotalRestakedAssets = useMemo(() => {
    if (!delegatorInfo?.delegations) {
      return {};
    }

    return delegatorInfo.delegations.reduce<Record<string, bigint>>(
      (acc, { amountBonded, assetId }) => {
        if (acc[assetId] === undefined) {
          acc[assetId] = amountBonded;
        } else {
          acc[assetId] += amountBonded;
        }
        return acc;
      },
      {},
    );
  }, [delegatorInfo?.delegations]);

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
          .map((asset) => {
            const selfStake = (() => {
              if (delegatorTotalRestakedAssets[asset.id] === undefined) {
                return 0;
              }

              return +formatUnits(
                delegatorTotalRestakedAssets[asset.id],
                asset.decimals,
              );
            })();

            const tvl = delegatorTVL?.[asset.id] ?? Number.NaN;

            return {
              id: asset.id,
              symbol: asset.symbol,
              tvl,
              selfStake,
            } satisfies VaultAssetUI;
          });

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
    [assetMap, delegatorTVL, delegatorTotalRestakedAssets],
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
        <OperatorsTable operatorMap={operatorMap} operatorTVL={operatorTVL} />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default TableTabs;
