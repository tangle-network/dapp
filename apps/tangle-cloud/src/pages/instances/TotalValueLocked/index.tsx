import { TableAndChartTabs } from '@tangle-network/ui-components/components/TableAndChartTabs';
import { LockFillIcon } from '@tangle-network/icons';
import { ReactElement, useState } from 'react';
import {
  TabContent,
  Typography,
  SkeletonLoader,
  Button,
} from '@tangle-network/ui-components';
import { useAccount } from 'wagmi';
import { useRestakingOverview } from '@tangle-network/tangle-shared-ui/data/restake/useRestakingData';
import { formatUnits } from 'viem';
import { Link } from 'react-router';
import { TangleDAppPagePath } from '../../../types';

enum TotalValueLockedTab {
  TVL = 'Total Value Locked',
}

const TotalValueLockedTabIcon: ReactElement[] = [
  <LockFillIcon className="w-4 h-4 !fill-blue-50" />,
] as const;

export const TotalValueLockedTabs = () => {
  const [selectedTab, setSelectedTab] = useState(TotalValueLockedTab.TVL);
  const { isConnected } = useAccount();

  // Use the unified restaking data hook
  const { positions, isLoading } = useRestakingOverview();

  // Format positions for display
  const tvlData = positions.map((pos) => ({
    id: pos.token,
    name: pos.symbol,
    symbol: pos.symbol,
    decimals: pos.decimals,
    amount: formatUnits(pos.deposited, pos.decimals),
    token: pos.token,
  }));

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
        className="flex justify-center mx-auto w-full"
      >
        {isLoading ? (
          <SkeletonLoader className="w-full h-48" />
        ) : !isConnected ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Typography variant="body1" className="text-mono-100">
              Connect wallet to view your TVL
            </Typography>
            <Typography variant="body2" className="text-mono-80">
              Connect your wallet to see your deposited assets
            </Typography>
          </div>
        ) : tvlData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Typography variant="body1" className="text-mono-100">
              No deposits found
            </Typography>
            <Typography variant="body2" className="text-mono-80 text-center">
              Start by depositing assets to see your TVL
            </Typography>
            <Link to={TangleDAppPagePath.RESTAKE}>
              <Button variant="secondary" size="sm">
                Go to Restake
              </Button>
            </Link>
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
