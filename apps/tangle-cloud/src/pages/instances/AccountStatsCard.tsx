import { useMemo, type FC } from 'react';
import AccountStatsDetailCard, {
  type AccountStatsCardProps,
} from '../../components/accountStatsCard';
import {
  Avatar,
  isSubstrateAddress,
  KeyValueWithButton,
  shortenString,
} from '@tangle-network/ui-components';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useSWRImmutable from 'swr/immutable';
import {
  getAccountInfo,
  IDENTITY_ICONS_RECORD,
  IdentityDataType,
} from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { isValidUrl } from '@tangle-network/dapp-types';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import { useOperatorStatsData } from '../../data/operators/useOperatorStatsData';
import { useUserStatsData } from '../../data/operators/useUserStatsData';

export const AccountStatsCard: FC<
  AccountStatsCardProps & { refreshTrigger?: number }
> = (props) => {
  const { refreshTrigger, ...cardProps } = props;
  const accountAddress = useActiveAccountAddress();
  const { isOperator } = useOperatorInfo();
  const rpcEndpoints = useNetworkStore((store) => store.network.wsRpcEndpoints);
  const network = useNetworkStore((store) => store.network);

  const { result: operatorStatsData } = useOperatorStatsData(
    useMemo(() => {
      if (
        !accountAddress ||
        !isOperator ||
        !isSubstrateAddress(accountAddress)
      ) {
        return null;
      }

      return accountAddress;
    }, [accountAddress, isOperator]),
    refreshTrigger,
  );

  const { result: userStatsData } = useUserStatsData(
    useMemo(() => {
      if (!accountAddress || !isSubstrateAddress(accountAddress)) {
        return null;
      }

      return accountAddress;
    }, [accountAddress]),
    refreshTrigger,
  );

  const { data: accountInfo } = useSWRImmutable(
    [rpcEndpoints, accountAddress],
    (args) => {
      if (!args[1]) {
        return null;
      }

      return getAccountInfo(args[0], args[1]);
    },
  );

  const identityName = useMemo(() => {
    if (!accountAddress) {
      return '';
    }

    const defaultName = shortenString(accountAddress);

    if (!accountInfo) {
      return defaultName;
    }

    return accountInfo.name || defaultName;
  }, [accountAddress, accountInfo]);

  const accountSocials = useMemo(() => {
    if (!accountInfo) {
      return [];
    }

    const twitterHandle = accountInfo?.twitter ?? '';

    const twitterUrl =
      twitterHandle === '' || isValidUrl(twitterHandle)
        ? twitterHandle
        : `https://x.com/${twitterHandle}`;

    const emailHandle = accountInfo?.email ?? '';

    const emailUrl =
      emailHandle === '' || isValidUrl(emailHandle)
        ? emailHandle
        : `mailto:${emailHandle}`;

    const socialInfos = {
      [IdentityDataType.TWITTER]: twitterUrl,
      // TODO: Add GitHub link.
      github: undefined,
      [IdentityDataType.EMAIL]: emailUrl,
      [IdentityDataType.WEB]: accountInfo?.web,
    };

    return Object.entries(socialInfos)
      .filter(([key, value]) => !!value && key in IDENTITY_ICONS_RECORD)
      .map(([key, value]) => ({
        name: key,
        href: value || '',
        Icon: IDENTITY_ICONS_RECORD[key as keyof typeof IDENTITY_ICONS_RECORD],
        target: '_blank' as const,
        rel: 'noopener noreferrer',
      }));
  }, [accountInfo]);

  const accountExplorerUrl = useMemo(() => {
    if (!accountAddress) {
      return null;
    }

    return network.createExplorerAccountUrl(accountAddress);
  }, [network, accountAddress]);

  const statsItems = useMemo(() => {
    // Default to empty array if no user stats data
    if (!userStatsData) {
      return [];
    }

    // Check if user is an active operator (has registered blueprints)
    const hasOperatorData =
      operatorStatsData && operatorStatsData.registeredBlueprints > 0;
    const isActiveOperator = isOperator && hasOperatorData;

    return [
      {
        title: 'Registered Blueprints',
        children: isActiveOperator ? operatorStatsData.registeredBlueprints : 0,
        tooltip: 'Number of blueprints you have registered as an operator',
      },
      {
        title: 'Running Services',
        children: isActiveOperator
          ? operatorStatsData.runningServices
          : userStatsData.runningServices,
        tooltip: isActiveOperator
          ? 'Services currently running that you operate as an operator'
          : 'Services currently running that you have deployed',
      },
      {
        title: 'Pending Services',
        children: isActiveOperator
          ? operatorStatsData.pendingServices
          : userStatsData.pendingServices,
        tooltip: isActiveOperator
          ? 'Service requests pending your approval/rejection as an operator'
          : 'Service requests you have submitted that are pending operator approval',
      },
      {
        title: 'Deployed Services',
        children: userStatsData.deployedServices,
        tooltip: 'Total services you have deployed as a user/deployer',
      },
    ];
  }, [operatorStatsData, userStatsData, isOperator]);

  return (
    <AccountStatsDetailCard.Root {...cardProps.rootProps}>
      <AccountStatsDetailCard.Header
        IconElement={
          <Avatar
            size="lg"
            value={accountAddress ?? ''}
            theme={isOperator ? 'substrate' : 'ethereum'}
          />
        }
        title={identityName}
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
        socialLinks={accountSocials}
      />
    </AccountStatsDetailCard.Root>
  );
};
