import { RefreshLineIcon, StatusIndicator } from '@tangle-network/icons';
import { useOperators } from '@tangle-network/tangle-shared-ui/data/graphql/useOperators';
import { useDelegatorCount } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';
import { useIndexerStatus } from '@tangle-network/tangle-shared-ui/context/IndexerStatusContext';
import type { ProtocolStakingAsset } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Card,
  CardVariant,
  EMPTY_VALUE_PLACEHOLDER,
  IconButton,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { FC, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';
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
  stakingAssets: ProtocolStakingAsset[];
  tvlData: { totalDeposits: bigint; assetCount: number } | null;
};

export const ProtocolStatisticCard: FC<Props> = ({
  className,
  isLoading,
  stakingAssets,
  tvlData,
}) => {
  const {
    data: operators,
    isLoading: isLoadingOperators,
    error: operatorsError,
    refetch: refetchOperators,
  } = useOperators({
    status: 'ACTIVE',
  });

  // Get unique staker (delegator) count
  const {
    data: stakerCount,
    isLoading: isLoadingStakers,
    error: stakerCountError,
    refetch: refetchStakerCount,
  } = useDelegatorCount();

  const { isHealthy, isCheckingHealth, checkHealth } = useIndexerStatus();

  // The indexer feeds Stakers and (when on-chain fallback also fails) Operators.
  // Surface a single muted notice rather than a row of EMPTY_VALUE_PLACEHOLDERs
  // that read as "card is broken".
  const isIndexerUnavailable =
    !isCheckingHealth &&
    (isHealthy === false ||
      stakerCountError !== null ||
      (operatorsError !== null && (operators?.length ?? 0) === 0));

  const handleRetry = useCallback(() => {
    void checkHealth();
    void refetchOperators();
    void refetchStakerCount();
  }, [checkHealth, refetchOperators, refetchStakerCount]);

  // Calculate TVL display value
  const tvlDisplay = useMemo(() => {
    if (!tvlData) return null;
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
            <div className="flex items-end gap-2 py-2">
              <Typography variant="h2" fw="bold" className="!leading-none">
                {tvlDisplay ?? EMPTY_VALUE_PLACEHOLDER}
              </Typography>

              <Typography variant="h4" className="!leading-none pb-1">
                USD
              </Typography>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          {isIndexerUnavailable && (
            <div className="flex items-center gap-2 text-mono-120 dark:text-mono-100">
              <Typography
                variant="body2"
                className="text-mono-120 dark:text-mono-100"
              >
                Network data temporarily unavailable. Retrying automatically.
              </Typography>

              <IconButton
                onClick={handleRetry}
                tooltip="Retry"
                aria-label="Retry network data"
                className="!p-1"
              >
                <RefreshLineIcon size="md" />
              </IconButton>
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            <StatsItem
              label="Stakers"
              result={stakerCount ?? null}
              isLoading={isLoadingStakers}
              error={stakerCountError ?? undefined}
              displayLabelBottom
            />

            <StatsItem
              label="Operators"
              result={operators?.length ?? null}
              isLoading={isLoadingOperators}
              error={
                operatorsError !== null && (operators?.length ?? 0) === 0
                  ? operatorsError
                  : undefined
              }
              displayLabelBottom
            />

            <StatsItem
              label="Assets"
              result={stakingAssets.length}
              isLoading={isLoading}
              displayLabelBottom
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
