import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { LockFillIcon } from '@tangle-network/icons';
import { ReactElement, useMemo, useState } from 'react';
import { TabContent, toSubstrateAddress } from '@tangle-network/ui-components';
import { TotalValueLockedTable } from './TotalValueLockedTable';  
import { useRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeRewardConfig from '@tangle-network/tangle-shared-ui/hooks/useRestakeRewardConfig';
import useRestakeAssetsTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssetsTvl';
import useVaultRewards from '@tangle-network/tangle-shared-ui/data/rewards/useVaultRewards';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import calculateVaults from '@tangle-network/ui-components/utils/calculateVaults';

enum ETotalValueLockedTab {
  TVL = 'Total Value Locked',
}

const TotalValueLockedTab: string[] = Object.values(
  ETotalValueLockedTab,
);
const TotalValueLockedTabIcon: ReactElement[] = [
  <LockFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export const TotalValueLockedTabs = () => {
  const [selectedTab, setSelectedTab] = useState(
    ETotalValueLockedTab.TVL,
  );

  const { isLoading, assets, balances } = useRestakeContext();
  const { delegatorInfo } = useRestakeDelegatorInfo();

  const address = useActiveAccountAddress();
  const { operatorMap } = useRestakeOperatorMap();
  const rewardConfig = useRestakeRewardConfig();
  const { result: vaultsRewards } = useVaultRewards();
  const assetTvl = useRestakeAssetsTvl();

  const operatorData = useMemo(() => {
    if (!address) {
      return null;
    }
    return operatorMap[toSubstrateAddress(address)];
  }, [operatorMap, address]);

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

  return (
    <TableAndChartTabs
      tabs={TotalValueLockedTab}
      icons={TotalValueLockedTabIcon}
      value={selectedTab}
      onValueChange={(tab) => setSelectedTab(tab as ETotalValueLockedTab)}
      className="space-y-9 w-full"
      triggerClassName=""
      enableAdvancedDivider
    >
      <TabContent
        value={ETotalValueLockedTab.TVL}
        className="flex justify-center mx-auto"
      >
        <TotalValueLockedTable data={vaults} isLoading={isLoading} error={null} loadingTableProps={{}} emptyTableProps={{}} />
      </TabContent>
    </TableAndChartTabs>
  );
};
