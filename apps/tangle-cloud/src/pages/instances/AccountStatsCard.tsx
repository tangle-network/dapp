import { useMemo, type FC } from 'react';
import AccountStatsDetailCard, {
  type AccountStatsCardProps,
} from '../../components/accountStatsCard';
import {
  Avatar,
  EMPTY_VALUE_PLACEHOLDER,
  isEvmAddress,
  isSubstrateAddress,
  KeyValueWithButton,
  shortenString,
} from '@tangle-network/ui-components';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeTvl from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTvl';
import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';
import useSWRImmutable from 'swr/immutable';
import {
  getAccountInfo,
  IDENTITY_ICONS_RECORD,
  IdentityDataType,
} from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { isValidUrl } from '@tangle-network/dapp-types';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';

export const AccountStatsCard: FC<AccountStatsCardProps> = (props) => {
  const accountAddress = useActiveAccountAddress();
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const { result: operatorMap } = useRestakeOperatorMap();
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorTvl } = useRestakeTvl(delegatorInfo);

  const network = useNetworkStore((store) => store.network);

  const evmAddress = useMemo(() => {
    if (!accountAddress) {
      return true;
    }

    return isEvmAddress(accountAddress);
  }, [accountAddress]);

  const operatorData = useMemo(() => {
    if (!accountAddress || evmAddress || !isSubstrateAddress(accountAddress)) {
      return null;
    }

    return operatorMap.get(accountAddress);
  }, [accountAddress, operatorMap, evmAddress]);

  const totalRestaked = useMemo(() => {
    if (
      !accountAddress ||
      !operatorData ||
      !isSubstrateAddress(accountAddress)
    ) {
      return EMPTY_VALUE_PLACEHOLDER;
    }

    return getTVLToDisplay(operatorTvl.get(accountAddress));
  }, [accountAddress, operatorTvl, operatorData]);

  const restakersCount = useMemo(
    () =>
      operatorData?.restakersCount.toLocaleString() ?? EMPTY_VALUE_PLACEHOLDER,
    [operatorData?.restakersCount],
  );

  const { data: operatorInfo } = useSWRImmutable(
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

    if (!operatorInfo) {
      return defaultName;
    }

    return operatorInfo.name || defaultName;
  }, [accountAddress, operatorInfo]);

  const validatorSocials = useMemo(() => {
    const twitterHandle = operatorInfo?.twitter ?? '';

    const twitterUrl =
      twitterHandle === '' || isValidUrl(twitterHandle)
        ? twitterHandle
        : `https://x.com/${twitterHandle}`;

    const emailHandle = operatorInfo?.email ?? '';

    const emailUrl =
      emailHandle === '' || isValidUrl(emailHandle)
        ? emailHandle
        : `mailto:${emailHandle}`;

    return {
      [IdentityDataType.TWITTER]: twitterUrl,
      // TODO: Add GitHub link.
      github: undefined,
      [IdentityDataType.EMAIL]: emailUrl,
      [IdentityDataType.WEB]: operatorInfo?.web,
    };
  }, [operatorInfo?.email, operatorInfo?.twitter, operatorInfo?.web]);

  const accountExplorerUrl = useMemo(() => {
    if (!accountAddress) {
      return null;
    }

    return network.createExplorerAccountUrl(accountAddress);
  }, [network, accountAddress]);

  return (
    <AccountStatsDetailCard.Root {...props.rootProps}>
      <AccountStatsDetailCard.Header
        IconElement={
          <Avatar
            size="lg"
            value={accountAddress ?? ''}
            theme={evmAddress ? 'ethereum' : 'substrate'}
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
        className="mb-10"
        {...props.headerProps}
      />

      <AccountStatsDetailCard.Body
        {...props.bodyProps}
        statsItems={[
          {
            title: 'Total Restake',
            children: totalRestaked,
          },
          {
            title: 'Restakers',
            children: restakersCount,
          },
        ]}
        socialLinks={Object.entries(validatorSocials)
          .filter(([key, value]) => !!value && key in IDENTITY_ICONS_RECORD)
          .map(([key, value]) => ({
            name: key,
            href: value || '',
            Icon: IDENTITY_ICONS_RECORD[
              key as keyof typeof IDENTITY_ICONS_RECORD
            ],
            target: '_blank',
            rel: 'noopener noreferrer',
          }))}
      />
    </AccountStatsDetailCard.Root>
  );
};
