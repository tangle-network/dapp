import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { LockFillIcon } from '@tangle-network/icons';
import { ReactElement, useMemo, useState } from 'react';
import {
  TabContent,
  Typography,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import { useAccount } from 'wagmi';
import {
  useRestakeAssets,
  useDelegator,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { formatUnits } from 'viem';

enum TotalValueLockedTab {
  TVL = 'Total Value Locked',
}

const TotalValueLockedTabIcon: ReactElement[] = [
  <LockFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export const TotalValueLockedTabs = () => {
  const [selectedTab, setSelectedTab] = useState(TotalValueLockedTab.TVL);

  const { address } = useAccount();
  const { assets, isLoading: isLoadingAssets } = useRestakeAssets();
  const { data: delegator, isLoading: isLoadingDelegator } =
    useDelegator(address);

  const isLoading = isLoadingAssets || isLoadingDelegator;

  // Calculate TVL from user's deposits (asset positions)
  const tvlData = useMemo(() => {
    if (!assets || !delegator) return [];

    const assetPositions = delegator.assetPositions ?? [];

    return assetPositions
      .map((position) => {
        const asset = assets.get(position.token);
        if (!asset) return null;

        const depositedAmount = formatUnits(
          position.totalDeposited,
          asset.metadata.decimals,
        );

        return {
          id: position.token,
          name: asset.metadata.name,
          symbol: asset.metadata.symbol,
          decimals: asset.metadata.decimals,
          amount: depositedAmount,
          token: position.token,
        };
      })
      .filter(Boolean);
  }, [assets, delegator]);

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
        {isLoading ? (
          <SkeletonLoader className="w-full h-48" />
        ) : tvlData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Typography variant="body1" className="text-mono-100">
              No deposits found
            </Typography>
            <Typography variant="body2" className="text-mono-80">
              Start by depositing assets to see your TVL
            </Typography>
          </div>
        ) : (
          <div className="w-full space-y-4">
            {tvlData.map(
              (item) =>
                item && (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg border-mono-60 dark:border-mono-140"
                  >
                    <div className="flex flex-col">
                      <Typography variant="body1" fw="bold">
                        {item.symbol}
                      </Typography>
                      <Typography variant="body2" className="text-mono-100">
                        {item.name}
                      </Typography>
                    </div>
                    <div className="flex flex-col items-end">
                      <Typography variant="body1" fw="bold">
                        {Number(item.amount).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })}
                      </Typography>
                      <Typography variant="body2" className="text-mono-100">
                        Deposited
                      </Typography>
                    </div>
                  </div>
                ),
            )}
          </div>
        )}
      </TabContent>
    </TableAndChartTabs>
  );
};
