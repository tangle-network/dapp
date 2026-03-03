'use client';

/**
 * Connection status indicator for the navbar.
 * Shows a colored indicator (green/yellow/red) based on:
 * - Wallet connection status
 * - Indexer/GraphQL availability
 */

import { StatusIndicator, Spinner } from '@tangle-network/icons';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAccount } from 'wagmi';
import {
  useIndexerStatus,
  type DataSource,
} from '../../context/IndexerStatusContext';

type StatusVariant = 'success' | 'warning' | 'error' | 'info';

type ConnectionStatusButtonProps = {
  /** Additional CSS classes */
  className?: string;
  /** Whether to show text label */
  showLabel?: boolean;
};

const getStatusVariant = (
  isWalletConnected: boolean,
  dataSource: DataSource,
  isCheckingHealth: boolean,
): StatusVariant => {
  if (isCheckingHealth) return 'info';
  if (!isWalletConnected) return 'warning';
  if (dataSource === 'graphql') return 'success';
  if (dataSource === 'onchain') return 'warning';
  return 'error';
};

const getStatusLabel = (
  isWalletConnected: boolean,
  dataSource: DataSource,
  isCheckingHealth: boolean,
): string => {
  if (isCheckingHealth) return 'Connecting';
  if (!isWalletConnected) return 'Not Connected';
  if (dataSource === 'graphql') return 'Connected';
  if (dataSource === 'onchain') return 'Limited';
  return 'Offline';
};

const getTooltipContent = (
  isWalletConnected: boolean,
  dataSource: DataSource,
  isCheckingHealth: boolean,
  errorMessage: string | null,
): { title: string; description: string } => {
  if (isCheckingHealth) {
    return {
      title: 'Checking Connection',
      description: 'Verifying indexer and network status...',
    };
  }

  if (!isWalletConnected) {
    return {
      title: 'Wallet Not Connected',
      description: 'Connect your wallet to interact with the network.',
    };
  }

  if (dataSource === 'graphql') {
    return {
      title: 'Fully Connected',
      description:
        'Wallet connected and indexer available. All features operational.',
    };
  }

  if (dataSource === 'onchain') {
    return {
      title: 'Limited Mode',
      description:
        errorMessage ??
        'Indexer unavailable. Using on-chain data. Some features may be limited.',
    };
  }

  return {
    title: 'Connection Issue',
    description:
      errorMessage ??
      'Unable to connect to data services. Please check your connection.',
  };
};

const getBorderColor = (variant: StatusVariant): string => {
  switch (variant) {
    case 'success':
      return 'border-green-50 dark:border-green-70';
    case 'warning':
      return 'border-yellow-50 dark:border-yellow-70';
    case 'error':
      return 'border-red-50 dark:border-red-70';
    default:
      return 'border-mono-60 dark:border-mono-140';
  }
};

const ConnectionStatusButton: FC<ConnectionStatusButtonProps> = ({
  className,
  showLabel = false,
}) => {
  const { isConnected: isWalletConnected, isConnecting } = useAccount();
  const { dataSource, isCheckingHealth, errorMessage } = useIndexerStatus();

  const isLoading = isConnecting || isCheckingHealth;
  const variant = getStatusVariant(
    isWalletConnected,
    dataSource,
    isCheckingHealth,
  );
  const label = getStatusLabel(isWalletConnected, dataSource, isCheckingHealth);
  const { title, description } = getTooltipContent(
    isWalletConnected,
    dataSource,
    isCheckingHealth,
    errorMessage,
  );

  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={twMerge(
            'rounded-lg border-2 p-2 flex items-center gap-2',
            'bg-mono-0/10 dark:bg-mono-0/5',
            'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
            'transition-colors cursor-default',
            getBorderColor(variant),
            className,
          )}
        >
          {isLoading ? (
            <Spinner size="md" />
          ) : (
            <StatusIndicator
              variant={variant}
              size={16}
              animated={variant === 'warning' || variant === 'error'}
            />
          )}

          {showLabel && (
            <Typography
              variant="body2"
              fw="semibold"
              className="hidden dark:text-mono-0 sm:block"
            >
              {label}
            </Typography>
          )}
        </div>
      </TooltipTrigger>

      <TooltipBody className="max-w-[280px]">
        <div className="space-y-1">
          <Typography variant="body1" fw="bold" className="dark:text-mono-0">
            {title}
          </Typography>
          <Typography
            variant="body2"
            className="text-mono-100 dark:text-mono-80"
          >
            {description}
          </Typography>
        </div>
      </TooltipBody>
    </Tooltip>
  );
};

export default ConnectionStatusButton;
