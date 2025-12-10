import { useMemo, type FC } from 'react';
import AccountStatsDetailCard, {
  type AccountStatsCardProps,
} from '../../components/accountStatsCard';
import {
  Avatar,
  KeyValueWithButton,
  shortenString,
  Chip,
} from '@tangle-network/ui-components';
import { useAccount, useChainId } from 'wagmi';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import useEvmOperatorInfo from '../../hooks/useEvmOperatorInfo';
import useOperatorStats from '../../data/operators/useOperatorStats';
import useUserStats from '../../data/operators/useUserStats';

export const AccountStatsCard: FC<
  AccountStatsCardProps & { refreshTrigger?: number }
> = (props) => {
  const { refreshTrigger, ...cardProps } = props;
  const { address: accountAddress } = useAccount();
  const chainId = useChainId();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  // Get chain config for explorer URL
  const activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  // Fetch operator stats if user is an operator
  const { result: operatorStatsData } = useOperatorStats(
    isOperator ? operatorAddress ?? undefined : undefined,
    refreshTrigger,
  );

  // Fetch user stats
  const { result: userStatsData } = useUserStats(accountAddress, refreshTrigger);

  const identityName = useMemo(() => {
    if (!accountAddress) {
      return '';
    }
    return shortenString(accountAddress);
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

    // Always show deployed services for all users
    items.push({
      title: 'Deployed Services',
      children: userStatsData.deployedServices,
      tooltip: 'Total services you have deployed as a user/deployer',
    });

    return items;
  }, [operatorStatsData, userStatsData, isOperator]);

  return (
    <AccountStatsDetailCard.Root {...cardProps.rootProps}>
      <AccountStatsDetailCard.Header
        IconElement={
          <Avatar
            size="lg"
            value={accountAddress ?? ''}
            theme="ethereum"
          />
        }
        title={identityName}
        RightElement={
          isOperator ? (
            <Chip color="blue" className="text-xs px-2 py-1">
              Operator
            </Chip>
          ) : undefined
        }
        description={
          <KeyValueWithButton
            size="sm"
            keyValue={accountAddress ?? ''}
            className="!text-mono-120 dark:!text-mono-100 font-normal"
          />
        }
        descExternalLink={accountExplorerUrl ?? ''}
        className="mb-5"
        {...props.headerProps}
      />

      <AccountStatsDetailCard.Body
        {...props.bodyProps}
        statsItems={statsItems}
        socialLinks={[]}
      />
    </AccountStatsDetailCard.Root>
  );
};
