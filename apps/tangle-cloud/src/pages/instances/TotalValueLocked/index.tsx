import { LockFillIcon } from '@tangle-network/icons';
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tangle-network/sandbox-ui/primitives';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useStakingOverview } from '@tangle-network/tangle-shared-ui/data/staking';
import { formatUnits } from 'viem';
import { Link } from 'react-router';
import { TangleDAppPagePath } from '../../../types';

enum TotalValueLockedTab {
  TVL = 'Total Value Locked',
}

export const TotalValueLockedTabs = () => {
  const [selectedTab, setSelectedTab] = useState(TotalValueLockedTab.TVL);
  const { isConnected } = useAccount();

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(tab: string) =>
        setSelectedTab(tab as TotalValueLockedTab)
      }
      className="w-full space-y-5"
    >
      <TabsList className="flex h-auto w-full justify-start rounded-lg border border-border bg-card p-1 shadow-[var(--shadow-card)]">
        <TabsTrigger
          value={TotalValueLockedTab.TVL}
          className="gap-2 rounded-md px-3 py-2 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <LockFillIcon className="h-4 w-4 fill-current" />
          Total Value Locked
        </TabsTrigger>
      </TabsList>

      <TabsContent value={TotalValueLockedTab.TVL} className="w-full">
        <Card variant="sandbox">
          <CardContent className="p-5">
            {!isConnected ? <DisconnectedTvlState /> : <ConnectedTvlState />}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

const DisconnectedTvlState = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
    <h2 className="font-display font-bold text-foreground text-lg">
      Connect wallet to view your TVL
    </h2>
    <p className="text-muted-foreground text-sm">
      Connect your wallet to see your deposited assets.
    </p>
  </div>
);

const ConnectedTvlState = () => {
  const { positions, isLoading } = useStakingOverview();

  const tvlData = positions.map((pos) => ({
    id: pos.token,
    name: pos.symbol,
    symbol: pos.symbol,
    decimals: pos.decimals,
    amount: formatUnits(pos.deposited, pos.decimals),
    token: pos.token,
  }));

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-lg" />;
  }

  if (tvlData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <h2 className="font-display font-bold text-foreground text-lg">
          No deposits found
        </h2>
        <p className="text-muted-foreground text-sm">
          Start by depositing assets to see your TVL.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to={TangleDAppPagePath.STAKING}>Go to Stake</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {tvlData.map(
        (item) =>
          item && (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
            >
              <div className="flex flex-col">
                <p className="font-display font-bold text-foreground">
                  {item.symbol}
                </p>
                <p className="text-muted-foreground text-sm">{item.name}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-display font-bold text-foreground">
                  {Number(item.amount).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                </p>
                <p className="text-muted-foreground text-sm">Deposited</p>
              </div>
            </div>
          ),
      )}
    </div>
  );
};
