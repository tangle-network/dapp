import { LockFillIcon } from '@tangle-network/icons';
import {
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import { useAccount } from 'wagmi';
import { useStakingOverview } from '@tangle-network/tangle-shared-ui/data/staking';
import { formatUnits } from 'viem';
import { Link } from 'react-router';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { TangleDAppPagePath } from '../../../types';

// Wallet-scoped deposits panel. Previously titled "Total Value Locked" which
// implied a network-wide metric — but the underlying hook (useStakingOverview)
// returns only the connected wallet's deposits. Renamed to "My Deposits" so
// the heading matches the data.
export const TotalValueLockedTabs = () => {
  const { isConnected } = useAccount();

  return (
    <Card variant="sandbox" className="w-full">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2 border-b border-border pb-3 font-display font-bold text-foreground text-sm tracking-tight">
          <LockFillIcon className="h-4 w-4 fill-current text-primary" />
          My deposits
        </div>
        {!isConnected ? <DisconnectedTvlState /> : <ConnectedTvlState />}
      </CardContent>
    </Card>
  );
};

const DisconnectedTvlState = () => (
  <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      <div className="font-display font-bold text-foreground text-base tracking-tight">
        Connect a wallet to view your deposits
      </div>
      <p className="mt-1 max-w-xl text-muted-foreground text-sm leading-relaxed">
        Personal deposits, running services, and operator exposure load once a
        wallet is connected. Public chain data on this page loads without one.
      </p>
    </div>
    <ConnectWalletButton className="tangle-cloud-wallet-action shrink-0" />
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
        <h3 className="font-display font-bold text-foreground text-lg">
          No deposits found
        </h3>
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
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
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
