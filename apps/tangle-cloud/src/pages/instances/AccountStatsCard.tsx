import { useMemo, type FC } from 'react';
import AccountStatsDetailCard, {
  type AccountStatsCardProps,
} from '../../components/accountStatsCard';
import {
  assertSubstrateAddress,
  Avatar,
  EMPTY_VALUE_PLACEHOLDER,
  isEvmAddress,
  KeyValueWithButton,
  shortenHex,
  shortenString,
  toSubstrateAddress,
} from '@tangle-network/ui-components';
import { ThreeDotsVerticalIcon } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeTVL from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTVL';
import { useWebContext } from '@tangle-network/api-provider-environment';
import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import useSWRImmutable from 'swr/immutable';
import {
  getAccountInfo,
  IDENTITY_ICONS_RECORD,
  IdentityDataType,
} from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { isHex } from 'viem';
import { isValidUrl } from '@tangle-network/dapp-types';

export const AccountStatsCard: FC<AccountStatsCardProps> = (props) => {
  const { activeAccount } = useWebContext();

  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);
  const { operatorMap } = useRestakeOperatorMap();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorTVL } = useRestakeTVL(operatorMap, delegatorInfo);

  const network = useNetworkStore((store) => store.network);

  const accountAddress = useMemo(() => {
    if (activeAccount?.address === undefined) {
      return null;
    } else if (isEvmAddress(activeAccount.address)) {
      return activeAccount.address;
    } else if (network.ss58Prefix === undefined) {
      return assertSubstrateAddress(activeAccount.address);
    }

    return toSubstrateAddress(activeAccount.address, network.ss58Prefix);
  }, [activeAccount?.address, network.ss58Prefix]);

  const operatorData = useMemo(() => {
    return accountAddress
      ? operatorMap[accountAddress as SubstrateAddress]
      : null;
  }, [accountAddress]);

  const totalRestaked = useMemo(
    () =>
      accountAddress
        ? getTVLToDisplay(operatorTVL[accountAddress])
        : EMPTY_VALUE_PLACEHOLDER,
    [accountAddress, operatorTVL],
  );

  const restakersCount = useMemo(
    () =>
      operatorData?.restakersCount.toLocaleString() ?? EMPTY_VALUE_PLACEHOLDER,
    [operatorData?.restakersCount],
  );

  const { data: operatorInfo } = useSWRImmutable(
    [rpcEndpoint, accountAddress],
    (args) => {
      if (!args[1]) return null;
      return getAccountInfo(args[0], args[1]);
    },
  );

  const identityName = useMemo(() => {
    if (!accountAddress) return '';
    const defaultName = isHex(accountAddress)
      ? shortenHex(accountAddress)
      : shortenString(accountAddress);

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
      // TODO: Add github link
      github: undefined,
      [IdentityDataType.EMAIL]: emailUrl,
      [IdentityDataType.WEB]: operatorInfo?.web,
      // TODO: Add location
      location: undefined,
    };
  }, [operatorInfo?.email, operatorInfo?.twitter, operatorInfo?.web]);

  const accountExplorerUrl = useMemo(() => {
    if (!accountAddress) return null;
    return network.createExplorerAccountUrl(accountAddress);
  }, [network, accountAddress]);

  return (
    <AccountStatsDetailCard.Root {...props.rootProps}>
      <AccountStatsDetailCard.Header
        IconElement={
          <Avatar
            size="lg"
            value={accountAddress ?? ''}
            theme={
              isEvmAddress(accountAddress ?? '') ? 'ethereum' : 'substrate'
            }
          />
        }
        title={identityName}
        description={
          <KeyValueWithButton size="sm" keyValue={accountAddress ?? ''} />
        }
        descExternalLink={accountExplorerUrl ?? ''}
        className="mb-10"
        {...props.headerProps}
        RightElement={<ThreeDotsVerticalIcon />}
      />

      <AccountStatsDetailCard.Body
        {...props.bodyProps}
        location={validatorSocials.location}
        totalRestake={totalRestaked}
        restakers={restakersCount}
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
