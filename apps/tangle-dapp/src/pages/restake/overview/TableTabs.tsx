import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import type {
  DelegatorInfo,
  OperatorMap,
} from '@webb-tools/tangle-shared-ui/types/restake';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';
import { type ComponentProps, type FC, ReactNode, useMemo } from 'react';
import VaultAssetsTable from '../../../components/tables/VaultAssets';
import VaultsTable from '../../../components/tables/Vaults';
import useRestakeRewardConfig from '../../../data/restake/useRestakeRewardConfig';
import OperatorsTable from './OperatorsTable';
import DepositForm from '../deposit/DepositForm';
import RestakeTabs from '../RestakeTabs';
import { RestakeAction } from '../../../constants';
import RestakeWithdrawPage from '../withdraw';
import RestakeStakePage from '../stake';
import RestakeUnstakePage from '../unstake';

enum RestakeTab {
  RESTAKE = 'Restake',
  VAULTS = 'Vaults',
  OPERATORS = 'Operators',
}

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
  action: RestakeAction;
};

const getFormOfRestakeAction = (action: RestakeAction): ReactNode => {
  switch (action) {
    case RestakeAction.DEPOSIT:
      return <DepositForm />;
    case RestakeAction.WITHDRAW:
      return <RestakeWithdrawPage />;
    case RestakeAction.DELEGATE:
      return <RestakeStakePage />;
    case RestakeAction.UNDELEGATE:
      return <RestakeUnstakePage />;
  }
};

const TableTabs: FC<Props> = ({
  delegatorInfo,
  delegatorTVL,
  operatorConcentration,
  operatorMap,
  operatorTVL,
  vaultTVL,
  action,
}) => {
  const { assetMap } = useRestakeContext();
  const { rewardConfig } = useRestakeRewardConfig();

  // Recalculate vaults data from assetMap
  const vaults = useMemo(() => {
    const vaults: Record<string, VaultUI> = {};

    for (const { vaultId, name, symbol } of Object.values(assetMap)) {
      if (vaultId === null) continue;

      if (vaults[vaultId] === undefined) {
        const apyPercentage = rewardConfig.configs[vaultId]?.apy ?? null;
        const tvlInUsd = vaultTVL?.[vaultId] ?? null;

        vaults[vaultId] = {
          id: vaultId,
          apyPercentage,
          // TODO: Find out a proper way to get the vault name, now it's the first token name
          name: name,
          // TODO: Find out a proper way to get the vault symbol, now it's the first token symbol
          representToken: symbol,
          tokensCount: 1,
          tvlInUsd,
        };
      } else {
        vaults[vaultId].tokensCount += 1;
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
        const vaultId = row.original.id;

        const vaultAssets = Object.values(assetMap)
          .filter((asset) => asset.vaultId === vaultId)
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
          <VaultAssetsTable isShown={row.getIsExpanded()} data={vaultAssets} />
        );
      },
    }),
    [assetMap, delegatorTVL, delegatorTotalRestakedAssets],
  );

  return (
    <TableAndChartTabs
      tabs={Object.values(RestakeTab)}
      headerClassName="w-full"
    >
      <TabContent
        value={RestakeTab.RESTAKE}
        className="flex justify-center min-w-[480px] mx-auto"
      >
        {getFormOfRestakeAction(action)}
      </TabContent>

      <TabContent value={RestakeTab.VAULTS}>
        <VaultsTable data={Object.values(vaults)} tableProps={tableProps} />
      </TabContent>

      <TabContent value={RestakeTab.OPERATORS}>
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
