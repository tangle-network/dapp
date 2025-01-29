import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import type {
  DelegatorInfo,
  OperatorMap,
} from '@webb-tools/tangle-shared-ui/types/restake';
import { TableAndChartTabs } from '@webb-tools/webb-ui-components/components/TableAndChartTabs';
import { TabContent } from '@webb-tools/webb-ui-components/components/Tabs/TabContent';
import {
  type ComponentProps,
  type FC,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import VaultAssetsTable from '../../components/tables/VaultAssets';
import VaultsTable from '../../components/tables/Vaults';
import useRestakeRewardConfig from '../../data/restake/useRestakeRewardConfig';
import OperatorsTable from './OperatorsTable';
import DepositForm from '../../pages/restake/deposit/DepositForm';
import { RestakeAction } from '../../constants';
import RestakeWithdrawForm from '../../pages/restake/withdraw';
import RestakeDelegateForm from '../../pages/restake/delegate';
import RestakeUnstakeForm from '../../pages/restake/unstake';
import BlueprintListing from '../../pages/blueprints/BlueprintListing';

enum RestakeTab {
  RESTAKE = 'Restake',
  VAULTS = 'Vaults',
  OPERATORS = 'Operators',
  BLUEPRINTS = 'Blueprints',
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
      return <RestakeWithdrawForm />;
    case RestakeAction.DELEGATE:
      return <RestakeDelegateForm />;
    case RestakeAction.UNDELEGATE:
      return <RestakeUnstakeForm />;
  }
};

const RestakeOverviewTabs: FC<Props> = ({
  delegatorInfo,
  delegatorTVL,
  operatorConcentration,
  operatorMap,
  operatorTVL,
  vaultTVL,
  action,
}) => {
  const [tab, setTab] = useState(RestakeTab.RESTAKE);

  const { vaults: vaultsMetadataMap } = useRestakeContext();
  const rewardConfig = useRestakeRewardConfig();

  // Recalculate vaults data from assetMap
  const vaults = useMemo(() => {
    const vaults: Record<string, VaultUI> = {};

    for (const { vaultId, name, symbol } of Object.values(vaultsMetadataMap)) {
      if (vaultId === null) {
        continue;
      } else if (vaults[vaultId] === undefined) {
        const apyPercentage =
          rewardConfig?.get(vaultId)?.apy.toNumber() ?? null;

        const tvlInUsd = vaultTVL?.[vaultId] ?? null;

        vaults[vaultId] = {
          id: vaultId,
          apyPercentage,
          // TODO: Find out a proper way to get the vault name, now it's the first token name
          name: name,
          // TODO: Find out a proper way to get the vault symbol, now it's the first token symbol
          representToken: symbol,
          tokenCount: 1,
          tvlInUsd,
        };
      } else {
        vaults[vaultId].tokenCount += 1;
      }
    }

    return vaults;
  }, [vaultsMetadataMap, rewardConfig, vaultTVL]);

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

        const vaultAssets = Object.values(vaultsMetadataMap)
          .filter((asset) => asset.vaultId === vaultId)
          .map((asset) => {
            const selfStake =
              delegatorTotalRestakedAssets[asset.assetId] ?? ZERO_BIG_INT;

            const tvl = delegatorTVL?.[asset.assetId] ?? null;

            return {
              id: asset.assetId,
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
    [vaultsMetadataMap, delegatorTVL, delegatorTotalRestakedAssets],
  );

  const handleRestakeClicked = useCallback(() => {
    setTab(RestakeTab.RESTAKE);
  }, []);

  return (
    <TableAndChartTabs
      tabs={Object.values(RestakeTab)}
      value={tab}
      onValueChange={(tab) => setTab(tab as RestakeTab)}
      headerClassName="w-full"
      className="space-y-9"
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
          onRestakeClicked={handleRestakeClicked}
        />
      </TabContent>

      <TabContent value={RestakeTab.BLUEPRINTS}>
        <BlueprintListing />
      </TabContent>
    </TableAndChartTabs>
  );
};

export default RestakeOverviewTabs;
