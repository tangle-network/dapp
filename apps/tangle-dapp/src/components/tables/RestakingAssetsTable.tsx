import { FC, useMemo } from 'react';
import {
  Card,
  CardVariant,
  EMPTY_VALUE_PLACEHOLDER,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { TokenIcon } from '@tangle-network/icons';
import type { RestakingAsset } from '@tangle-network/tangle-shared-ui/data/graphql/useRestakingAssets';
import type { Delegator } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import { formatUnits, Address } from 'viem';
import { twMerge } from 'tailwind-merge';
import { getLocalTokenByAddress } from '@tangle-network/dapp-config/localTokens';

interface Props {
  assets: RestakingAsset[];
  delegator: Delegator | null;
  isLoading: boolean;
}

// Get token symbol from address using local token config or fallback to truncated address
const getTokenSymbol = (tokenAddress: string): string => {
  const localToken = getLocalTokenByAddress(tokenAddress as Address);
  if (localToken) {
    return localToken.symbol;
  }
  // Fallback to truncated address
  return `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;
};

const formatAmount = (amount: bigint, decimals: number): string => {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toLocaleString(undefined, {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  });
};

export const RestakingAssetsTable: FC<Props> = ({
  assets,
  delegator,
  isLoading,
}) => {
  // Get user's positions for each asset
  const assetPositions = useMemo(() => {
    if (!delegator) return new Map();
    const positions = new Map<
      string,
      { deposited: bigint; delegated: bigint }
    >();
    for (const pos of delegator.assetPositions) {
      positions.set(pos.token.toLowerCase(), {
        deposited: pos.totalDeposited,
        delegated: pos.delegatedAmount,
      });
    }
    return positions;
  }, [delegator]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonLoader className="h-16" />
        <SkeletonLoader className="h-16" />
        <SkeletonLoader className="h-16" />
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6 text-center">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          No restaking assets available.
        </Typography>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-5 gap-4 px-4 py-2 text-mono-120 dark:text-mono-80">
        <Typography variant="body2" fw="semibold">
          Asset
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Total Deposits
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Min Delegation
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Your Deposit
        </Typography>
        <Typography variant="body2" fw="semibold" className="text-right">
          Your Delegated
        </Typography>
      </div>

      {/* Rows */}
      {assets.map((asset) => {
        const position = assetPositions.get(asset.token.toLowerCase());
        const localToken = getLocalTokenByAddress(asset.token as Address);
        const decimals = localToken?.decimals ?? 18;
        const symbol = getTokenSymbol(asset.token);

        return (
          <Card
            key={asset.id}
            variant={CardVariant.GLASS}
            className={twMerge(
              'grid grid-cols-5 gap-4 px-4 py-3 items-center',
              'hover:bg-mono-20/50 dark:hover:bg-mono-180/50 transition-colors',
            )}
          >
            <div className="flex items-center gap-3">
              <TokenIcon name={symbol} size="lg" />
              <div>
                <Typography variant="body1" fw="semibold">
                  {symbol}
                </Typography>
                <Typography
                  variant="body2"
                  className="text-mono-100 dark:text-mono-100"
                >
                  {localToken?.name ?? (asset.enabled ? 'Enabled' : 'Disabled')}
                </Typography>
              </div>
            </div>

            <Typography variant="body1" className="text-right">
              {formatAmount(asset.currentDeposits, decimals)}
            </Typography>

            <Typography variant="body1" className="text-right">
              {formatAmount(asset.minDelegation, decimals)}
            </Typography>

            <Typography variant="body1" className="text-right">
              {position
                ? formatAmount(position.deposited, decimals)
                : EMPTY_VALUE_PLACEHOLDER}
            </Typography>

            <Typography variant="body1" className="text-right">
              {position
                ? formatAmount(position.delegated, decimals)
                : EMPTY_VALUE_PLACEHOLDER}
            </Typography>
          </Card>
        );
      })}
    </div>
  );
};

export default RestakingAssetsTable;
