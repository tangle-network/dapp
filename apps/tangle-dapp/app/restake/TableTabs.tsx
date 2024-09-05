'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';
import { type ComponentProps, type FC, useMemo } from 'react';

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
  delegatorInfo: DelegatorInfo | null;
  delegatorTVL?: Record<string, number>;
  operatorConcentration?: Record<string, number | null>;
  operatorMap: OperatorMap;
  operatorTVL?: Record<string, number>;
  vaultTVL?: Record<string, number>;
};

const TableTabs: FC<Props> = ({
  delegatorInfo,
  delegatorTVL,
  operatorConcentration,
  operatorMap,
  operatorTVL,
  vaultTVL,
}) => {
  const { assetMap } = useRestakeContext();

  const { rewardConfig } = useRestakeRewardConfig();

  // Recalculate vaults (pools) data from assetMap
  const vaults = useMemo(() => {
    const vaults: Record<string, VaultUI> = {};

    for (const { poolId, name, symbol } of Object.values(assetMap)) {
      if (poolId === null) continue;

      if (vaults[poolId] === undefined) {
        const apyPercentage = rewardConfig.configs[poolId]?.apy ?? null;
        const tvlInUsd = vaultTVL?.[poolId] ?? null;

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
            const selfStake =
              delegatorTotalRestakedAssets[asset.id] ?? ZERO_BIG_INT;

            const tvl = delegatorTVL?.[asset.id] ?? null;

            return {
              id: asset.id,
              symbol: asset.symbol,
              decimals: asset.decimals,
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
        <OperatorsTable
          operatorConcentration={operatorConcentration}
          operatorMap={operatorMap}
          operatorTVL={operatorTVL}
        />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default TableTabs;
