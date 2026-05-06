'use client';

/**
 * Banner component that shows the current data source status.
 * Displays a warning when using on-chain fallback instead of the indexer.
 */

import { type FC } from 'react';
import { Alert } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components';
import { twMerge } from 'tailwind-merge';
import { useIndexerStatus } from '../context/IndexerStatusContext';

interface DataSourceBannerProps {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show in compact mode */
  compact?: boolean;
  /** Override the automatic visibility (always show if true) */
  alwaysShow?: boolean;
}

/**
 * Shows a banner when the GraphQL indexer is unavailable.
 * Automatically hides when using GraphQL (healthy indexer).
 */
export const DataSourceBanner: FC<DataSourceBannerProps> = ({
  className,
  compact = false,
  alwaysShow = false,
}) => {
  const { dataSource, isCheckingHealth, errorMessage } = useIndexerStatus();

  // Don't show when using GraphQL or still checking
  if (!alwaysShow && (dataSource === 'graphql' || isCheckingHealth)) {
    return null;
  }

  const isOnChain = dataSource === 'onchain';
  const isUnavailable = dataSource === 'unavailable';

  if (compact) {
    return (
      <div
        className={twMerge(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
          isOnChain && 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
          isUnavailable && 'bg-red-500/10 text-red-600 dark:text-red-400',
          className,
        )}
      >
        <Alert className="w-4 h-4 fill-current" />
        <span>{isOnChain ? 'Limited data mode' : 'Data unavailable'}</span>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        'flex items-start gap-3 p-4 rounded-lg border',
        isOnChain && 'bg-yellow-500/5 border-yellow-500/20',
        isUnavailable && 'bg-red-500/5 border-red-500/20',
        className,
      )}
    >
      <Alert
        className={twMerge(
          'w-5 h-5 mt-0.5 shrink-0',
          isOnChain && 'fill-yellow-600 dark:fill-yellow-400',
          isUnavailable && 'fill-red-600 dark:fill-red-400',
        )}
      />

      <div className="flex flex-col gap-1">
        <Typography
          variant="body1"
          fw="semibold"
          className={twMerge(
            isOnChain && 'text-yellow-700 dark:text-yellow-300',
            isUnavailable && 'text-red-700 dark:text-red-300',
          )}
        >
          {isOnChain ? 'Limited Data Mode' : 'Indexer Unavailable'}
        </Typography>

        <Typography variant="body2" className="text-mono-120 dark:text-mono-80">
          {isOnChain
            ? 'The indexer is temporarily unavailable. Some data may be limited or unavailable. Core functionality remains operational.'
            : (errorMessage ??
              'Unable to connect to data services. Please try again later.')}
        </Typography>
      </div>
    </div>
  );
};

/**
 * Inline indicator for data source (for use in headers/toolbars).
 */
export const DataSourceIndicator: FC<{ className?: string }> = ({
  className,
}) => {
  const { dataSource, isCheckingHealth } = useIndexerStatus();

  if (isCheckingHealth || dataSource === 'graphql') {
    return null;
  }

  return (
    <div
      className={twMerge(
        'flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
        dataSource === 'onchain' &&
          'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
        dataSource === 'unavailable' &&
          'bg-red-500/10 text-red-600 dark:text-red-400',
        className,
      )}
      title={
        dataSource === 'onchain'
          ? 'Using on-chain data (indexer unavailable)'
          : 'Data services unavailable'
      }
    >
      <span
        className={twMerge(
          'w-2 h-2 rounded-full',
          dataSource === 'onchain' && 'bg-yellow-500',
          dataSource === 'unavailable' && 'bg-red-500',
        )}
      />
      {dataSource === 'onchain' ? 'Limited' : 'Offline'}
    </div>
  );
};

export default DataSourceBanner;
