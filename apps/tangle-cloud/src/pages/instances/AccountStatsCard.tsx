import { useMemo, type FC } from 'react';
import {
  Badge,
  Card,
  CardContent,
} from '@tangle-network/sandbox-ui/primitives';
import { Avatar } from '@tangle-network/ui-components';
import { ExternalLinkLine } from '@tangle-network/icons';
import { useAccount, useChainId } from 'wagmi';
import ConnectWalletButton from '@tangle-network/tangle-shared-ui/components/ConnectWalletButton';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import useEvmOperatorInfo from '../../hooks/useEvmOperatorInfo';
import useOperatorStats from '../../data/operators/useOperatorStats';
import useUserStats from '../../data/operators/useUserStats';
import { twMerge } from 'tailwind-merge';

type AccountStatsCardProps = {
  refreshTrigger?: number;
  rootProps?: { className?: string };
};

export const AccountStatsCard: FC<AccountStatsCardProps> = (props) => {
  const { refreshTrigger, rootProps } = props;
  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  // Get chain config for explorer URL
  const activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  // Fetch operator stats if user is an operator
  const { result: operatorStatsData } = useOperatorStats(
    isOperator ? (operatorAddress ?? undefined) : undefined,
    refreshTrigger,
  );

  // Fetch user stats
  const { result: userStatsData } = useUserStats(
    accountAddress,
    refreshTrigger,
  );

  const identityName = useMemo(() => {
    if (!accountAddress) {
      return 'Wallet not connected';
    }
    return shortenAddress(accountAddress);
  }, [accountAddress]);

  const accountExplorerUrl = useMemo(() => {
    if (!accountAddress || !activeChain?.blockExplorers?.default?.url) {
      return null;
    }
    return `${activeChain.blockExplorers.default.url}/address/${accountAddress}`;
  }, [accountAddress, activeChain]);

  const statsItems = useMemo(() => {
    // Default to empty array if no user stats data
    if (!userStatsData) {
      return [];
    }

    // Check if user is an active operator (has registered blueprints)
    const hasOperatorData =
      operatorStatsData && operatorStatsData.registeredBlueprints > 0;
    const isActiveOperator = isOperator && hasOperatorData;

    const items = [];

    // Only show operator-specific stats if user is an operator with registered blueprints
    if (isActiveOperator) {
      items.push(
        {
          title: 'Registered Blueprints',
          children: operatorStatsData.registeredBlueprints,
          tooltip: 'Number of blueprints you have registered as an operator',
        },
        {
          title: 'Running Services',
          children: operatorStatsData.runningServices,
          tooltip: 'Services currently running that you operate as an operator',
        },
        {
          title: 'Pending Services',
          children: operatorStatsData.pendingServices,
          tooltip:
            'Service requests pending your approval/rejection as an operator',
        },
      );
    }

    // Show user's running services only for non-operators (operators already have it above)
    if (!isActiveOperator) {
      items.push({
        title: 'Running Services',
        children: userStatsData.runningServices,
        tooltip: 'Services you deployed that are currently running',
      });
    }

    // Always show deployed services for all users
    items.push({
      title: 'Deployed Services',
      children: userStatsData.deployedServices,
      tooltip: 'Total services you have deployed as a user/deployer',
    });

    return items;
  }, [operatorStatsData, userStatsData, isOperator]);

  if (!accountAddress) {
    return (
      <Card
        variant="elevated"
        className={twMerge('w-full', rootProps?.className)}
      >
        <CardContent className="flex h-full flex-col gap-5 p-5 md:p-6">
          <div className="min-w-0">
            <p className="font-semibold text-mono-120 dark:text-mono-100 text-xs uppercase tracking-wider">
              Account
            </p>
            <div className="mt-2 font-display font-bold text-mono-200 dark:text-mono-0 text-lg tracking-tight">
              Connect a wallet to load your account
            </div>
            <p className="mt-2 max-w-xl text-mono-120 dark:text-mono-100 text-sm leading-relaxed">
              Connect to load deployed services, operator registrations, and
              account-scoped lifecycle events. Public catalog and operator
              registry data load below without a wallet.
            </p>
          </div>
          <div className="mt-auto">
            <ConnectWalletButton className="tangle-cloud-wallet-action" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="sandbox" className={twMerge('w-full', rootProps?.className)}>
      <CardContent className="space-y-5 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar
              sourceVariant="address"
              value={accountAddress}
              theme="ethereum"
              size="lg"
            />
            <div className="min-w-0">
              <div className="truncate font-display font-bold text-mono-200 dark:text-mono-0 text-lg tracking-tight">
                {identityName}
              </div>
              <div className="mt-1 flex items-center gap-2 text-mono-120 dark:text-mono-100 text-xs">
                <span className="truncate font-mono">
                  {accountAddress ?? 'Connect a wallet to see your account'}
                </span>
                {accountExplorerUrl && (
                  <a
                    href={accountExplorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-mono-120 dark:text-mono-100 transition-colors hover:text-purple-40"
                    aria-label="Open account in explorer"
                  >
                    <ExternalLinkLine className="h-4 w-4 fill-current" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {isOperator && <Badge variant="success">Operator</Badge>}
        </div>

        <div className="grid min-h-[120px] grid-cols-2 overflow-hidden rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180">
          {Array.from({ length: 4 }).map((_, index) => {
            const item = statsItems[index];
            const isLeftColumn = index % 2 === 0;
            const isTopRow = index < 2;

            return (
              <div
                key={item?.title ?? `placeholder-${index}`}
                className={twMerge(
                  'min-h-24 p-4',
                  isLeftColumn &&
                    'border-r border-mono-60 dark:border-mono-170',
                  isTopRow && 'border-b border-mono-60 dark:border-mono-170',
                )}
                title={item?.tooltip}
              >
                {item && (
                  <>
                    <p className="text-mono-120 dark:text-mono-100 text-xs">
                      {item.title}
                    </p>
                    <p className="mt-2 font-display font-bold text-mono-200 dark:text-mono-0 text-2xl">
                      {item.children}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

const shortenAddress = (address: string) => {
  if (address.length <= 16) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
