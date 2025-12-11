import { StatusIndicator } from '@tangle-network/icons';
import { useOperators } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { useDelegatorCount } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import type { RestakingAsset } from '@tangle-network/tangle-shared-ui/data/graphql/useRestakingAssets';
import {
  Card,
  CardVariant,
  EMPTY_VALUE_PLACEHOLDER,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { FC, useMemo } from 'react';
import { formatUnits } from 'viem';
import { twMerge } from 'tailwind-merge';
import { StatsItem } from './StatsItem';

// Format large numbers with SI suffixes (K, M, B)
const formatLargeNumber = (num: number, decimals = 2): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(decimals) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(decimals) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
};

type Props = {
  className?: string;
  isLoading: boolean;
  restakingAssets: RestakingAsset[];
  tvlData: { totalDeposits: bigint; assetCount: number } | null;
};

export const ProtocolStatisticCard: FC<Props> = ({
  className,
  isLoading,
  restakingAssets,
  tvlData,
}) => {
  // Get operator count from GraphQL
  const { data: operators, isLoading: isLoadingOperators } = useOperators({
    status: 'ACTIVE',
  });

  // Get unique restaker (delegator) count
  const { data: restakerCount, isLoading: isLoadingRestakers } =
    useDelegatorCount();

  // Calculate TVL display value (using first asset's decimals as estimate)
  const tvlDisplay = useMemo(() => {
    if (!tvlData || tvlData.totalDeposits === BigInt(0)) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    // Use 18 decimals as default (ETH standard)
    const formatted = formatUnits(tvlData.totalDeposits, 18);
    const num = parseFloat(formatted);
    return formatLargeNumber(num, 2);
  }, [tvlData]);

  return (
    <Card
      variant={CardVariant.GLASS}
      className={twMerge(className, 'p-0 flex overflow-hidden')}
    >
      <div className="p-6 grow flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <StatusIndicator size={16} variant="success" />
          <Typography
            variant="h5"
            fw="bold"
            className={twMerge(
              'bg-gradient-to-r from-purple-50 to-mono-100',
              'dark:from-mono-100 dark:to-purple-40',
              'bg-clip-text text-transparent dark:text-transparent',
            )}
          >
            Now Live: Season 1
          </Typography>
        </div>

        <div>
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-80"
          >
            Total Value Locked
          </Typography>

          {isLoading ? (
            <SkeletonLoader className="h-14 w-full max-w-36 my-2" />
          ) : (
            <div className="flex items-center gap-3 py-2">
              <Typography variant="h2" fw="bold" className="!leading-none">
                {tvlDisplay}
              </Typography>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6 mt-auto">
          <StatsItem
            label="Restakers"
            result={restakerCount ?? null}
            isLoading={isLoadingRestakers}
            error={null}
            displayLabelBottom
          />

          <StatsItem
            label="Operators"
            result={operators?.length ?? null}
            isLoading={isLoadingOperators}
            error={null}
            displayLabelBottom
          />

          <StatsItem
            label="Assets"
            result={restakingAssets.length}
            isLoading={isLoading}
            error={null}
            displayLabelBottom
          />
        </div>
      </div>
    </Card>
  );
};
