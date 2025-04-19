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
import useOperatorInfo from '../../hooks/useOperatorInfo';
import { useOperatorStatsData } from '../../data/operators/useOperatorStatsData';
import { useUserStatsData } from '../../data/operators/useUserStatsData';

export const AccountStatsCard: FC<AccountStatsCardProps> = (props) => {
  const accountAddress = useActiveAccountAddress();
  const { isOperator } = useOperatorInfo();
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const network = useNetworkStore((store) => store.network);

  const operatorStatsData = useOperatorStatsData(
    useMemo(() => {
      if (
        !accountAddress ||
        !isOperator ||
        !isSubstrateAddress(accountAddress)
      ) {
        return null;
      }

      return accountAddress;
    }, [accountAddress, isOperator, isSubstrateAddress]),
  );

  const userStatsData = useUserStatsData(
    useMemo(() => {
      if (isOperator) {
        return null;
      }

      return accountAddress;
    }, [isOperator, accountAddress]),
  );

  const { data: accountInfo } = useSWRImmutable(
    [rpcEndpoint, accountAddress],
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
  }, [accountInfo?.email, accountInfo?.twitter, accountInfo?.web, isOperator]);

  const accountExplorerUrl = useMemo(() => {
    if (!accountAddress) {
      return null;
    }

    return network.createExplorerAccountUrl(accountAddress);
  }, [network, accountAddress]);

  const statsItems = useMemo(() => {
    if (isOperator && !operatorStatsData) {
      return [];
    }

    // operator
    if (isOperator && operatorStatsData) {
      return [
        {
          title: 'Registered Blueprints',
          children: operatorStatsData.registeredBlueprints,
        },
        {
          title: 'Total Services',
          children: operatorStatsData.totalServices,
          tooltip: 'Total services including stopped and running services',
        },
        {
          title: 'Pending Services',
          children: operatorStatsData.pendingServices,
          tooltip: 'Pending services waiting to be deployed',
        },
        {
          title: 'Deployed Services',
          children: operatorStatsData.deployedServices,
          tooltip: 'Total services you have requested Operator to operate',
        },
        {
          title: 'Avg Uptime',
          children: operatorStatsData.avgUptime,
          tooltip: 'Average online time of Operator',
        },
        {
          title: 'Published Services',
          children: operatorStatsData.publishedServices,
          tooltip: 'Total services published to Tangle ecosystem',
        },
      ];
    }

    // others

    return [
      {
        title: 'Total Services',
        children: userStatsData?.totalServices,
        tooltip:
          'Total services including stopped, running services, and consuming services',
      },
      {
        title: 'Deployed Services',
        children: userStatsData?.deployedServices,
        tooltip: 'Total services you have requested Operator to operate',
      },
      {
        title: 'Pending Services',
        children: userStatsData?.pendingServices,
      },
      {
        title: 'Consuming Services',
        children: userStatsData?.consumedServices,
      },
    ];
  }, [operatorStatsData, userStatsData]);

  return (
    <AccountStatsDetailCard.Root {...props.rootProps}>
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
