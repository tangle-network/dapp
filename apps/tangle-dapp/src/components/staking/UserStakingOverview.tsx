import { FC, useMemo } from 'react';
import {
  Card,
  CardVariant,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { TokenIcon, WalletLineIcon } from '@tangle-network/icons';
import type { Delegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import type { StakingAssetMap } from '@tangle-network/tangle-shared-ui/data/graphql';
import { formatUnits, Address } from 'viem';
import { twMerge } from 'tailwind-merge';
import { useAccount } from 'wagmi';

interface Props {
  delegator: Delegator | null;
  assets: StakingAssetMap | null;
  isLoading: boolean;
}

const formatBalance = (amount: bigint, decimals: number): string => {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.001) return '< 0.001';
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

export const UserStakingOverview: FC<Props> = ({
  delegator,
  assets,
  isLoading,
}) => {
  const { isConnected } = useAccount();

  // Get position details for each asset
  const positions = useMemo(() => {
    if (!delegator || !assets) return [];
    return delegator.assetPositions
      .filter(
        (pos) =>
          pos.totalDeposited > BigInt(0) || pos.delegatedAmount > BigInt(0),
      )
      .map((pos) => {
        const asset = assets.get(pos.token as Address);
        return {
          token: pos.token,
          symbol: asset?.metadata.symbol ?? 'Unknown',
          decimals: asset?.metadata.decimals ?? 18,
          deposited: pos.totalDeposited,
          delegated: pos.delegatedAmount,
          locked: pos.lockedAmount,
        };
      });
  }, [delegator, assets]);

  // Get pending requests count
  const pendingCount = useMemo(() => {
    if (!delegator) return 0;
    return delegator.withdrawRequests.length + delegator.unstakeRequests.length;
  }, [delegator]);

  if (isLoading) {
    return <SkeletonLoader className="h-32" />;
  }

  // No positions - show empty state. Wallet-disconnected and "connected but
  // empty" read very differently, so split the copy.
  if (positions.length === 0) {
    const { title, body } = isConnected
      ? {
          title: 'No active positions',
          body: 'Deposit a supported asset below to start earning. Your deposited, delegated, and pending balances appear here once on-chain.',
        }
      : {
          title: 'Connect a wallet to view your positions',
          body: 'Deposited, delegated, and pending balances appear here once a wallet is connected. The asset catalog below loads without a wallet.',
        };

    return (
      <Card
        variant={CardVariant.GLASS}
        className="flex flex-col items-center gap-3 p-6 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mono-20 dark:bg-mono-160">
          <WalletLineIcon
            size="lg"
            className="!fill-mono-120 dark:!fill-mono-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Typography
            variant="body1"
            fw="semibold"
            className="text-mono-200 dark:text-mono-0"
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            className="max-w-2xl text-mono-120 dark:text-mono-80"
          >
            {body}
          </Typography>
        </div>
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="h5" fw="bold">
          Your Positions
        </Typography>

        {pendingCount > 0 && (
          <Typography variant="body2" className="text-mono-100">
            {pendingCount} pending request{pendingCount !== 1 ? 's' : ''}
          </Typography>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-8 items-center">
        <div />
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-80 text-right pb-2"
        >
          Deposited
        </Typography>
        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-80 text-right pb-2"
        >
          Delegated
        </Typography>

        {positions.map((pos, index) => (
          <div
            key={pos.token}
            className={twMerge(
              'col-span-3 grid grid-cols-subgrid items-center p-3 rounded-lg',
              'bg-mono-20/50 dark:bg-mono-180/50',
              index > 0 && 'mt-3',
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10">
                <TokenIcon name={pos.symbol} size="xl" />
              </div>

              <div>
                <Typography variant="body1" fw="semibold">
                  {pos.symbol}
                </Typography>

                <Typography
                  variant="body2"
                  className="text-mono-120 dark:text-mono-80"
                >
                  {pos.token.slice(0, 6)}...{pos.token.slice(-4)}
                </Typography>
              </div>
            </div>

            <Typography variant="body1" fw="semibold" className="text-right">
              {formatBalance(pos.deposited, pos.decimals)}
            </Typography>

            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-80 text-right"
            >
              {formatBalance(pos.delegated, pos.decimals)}
            </Typography>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UserStakingOverview;
