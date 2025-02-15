import { isHex } from '@polkadot/util';
import isValidUrl from '@tangle-network/dapp-types/utils/isValidUrl';
import { ExternalLinkLine } from '@tangle-network/icons/ExternalLinkLine';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import type {
  DelegatorInfo,
  OperatorMap,
  OperatorMetadata,
} from '@tangle-network/tangle-shared-ui/types/restake';
import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';
import { getAccountInfo } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import { Card, CardVariant } from '@tangle-network/ui-components';
import { Chip } from '@tangle-network/ui-components/components/Chip';
import InfoIconWithTooltip from '@tangle-network/ui-components/components/IconWithTooltip/InfoIconWithTooltip';
import { KeyValueWithButton } from '@tangle-network/ui-components/components/KeyValueWithButton';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { type ComponentProps, type FC, type ReactNode, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { twMerge } from 'tailwind-merge';

import AvatarWithText from '../../../../components/AvatarWithText';
import ValidatorSocials from '../../../../components/ValidatorSocials';

interface Props extends Partial<ComponentProps<typeof Card>> {
  operatorAddress: string;
  operatorData: OperatorMetadata | undefined;
  operatorMap: OperatorMap;
  delegatorInfo: DelegatorInfo | null;
  operatorTVL: Record<string, number>;
}

const OperatorInfoCard: FC<Props> = ({
  className,
  operatorAddress,
  operatorData,
  operatorMap,
  delegatorInfo,
  operatorTVL,
  ...props
}) => {
  const rpcEndpoint = useNetworkStore((store) => store.network.wsRpcEndpoint);

  const isRestaked = useMemo<boolean>(() => {
    if (delegatorInfo === null) {
      return false;
    }

    const foundDelegation = delegatorInfo.delegations.find(
      (delegation) => delegation.operatorAccountId === operatorAddress,
    );

    return Boolean(foundDelegation);
  }, [delegatorInfo, operatorAddress]);

  const totalRestaked = useMemo(
    () => getTVLToDisplay(operatorTVL[operatorAddress]),
    [operatorAddress, operatorTVL],
  );

  const restakersCount = useMemo(
    () => operatorData?.restakersCount.toString() ?? EMPTY_VALUE_PLACEHOLDER,
    [operatorData?.restakersCount],
  );

  const { data: operatorInfo } = useSWRImmutable(
    [rpcEndpoint, operatorAddress],
    (args) => getAccountInfo(...args),
  );

  const identityName = useMemo(() => {
    const defaultName = isHex(operatorAddress)
      ? shortenHex(operatorAddress)
      : shortenString(operatorAddress);

    if (!operatorInfo) {
      return defaultName;
    }

    return operatorInfo.name || defaultName;
  }, [operatorAddress, operatorInfo]);

  const validatorSocials = useMemo(() => {
    const twitterHandle = operatorInfo?.twitter ?? '';
    const webUrl = operatorInfo?.web ?? '';
    const email = operatorInfo?.email ?? '';

    const twitterUrl =
      twitterHandle === '' || isValidUrl(twitterHandle)
        ? twitterHandle
        : `https://x.com/${twitterHandle}`;

    return {
      twitterUrl,
      webUrl,
      email,
      // TODO: Add location
      location: '',
      // TODO: Add github link
      githubUrl: '',
    };
  }, [operatorInfo?.email, operatorInfo?.twitter, operatorInfo?.web]);

  return (
    <Card
      variant={CardVariant.GLASS}
      {...props}
      className={twMerge('gap-10', className)}
    >
      <div className="flex items-start justify-between">
        <AvatarWithText
          overrideAvatarProps={{
            size: 'lg',
          }}
          overrideTypographyProps={{
            variant: 'h4',
            fw: 'bold',
          }}
          accountAddress={operatorAddress}
          identityName={identityName}
          description={
            <div className="flex items-baseline gap-1">
              <KeyValueWithButton
                className="mt-1"
                size="sm"
                keyValue={operatorAddress}
              />

              <ExternalLinkLine />
            </div>
          }
        />

        {isRestaked && <Chip color="green">Restaked</Chip>}
      </div>

      <div className="flex flex-wrap gap-4">
        <StatsItem label="Total Restake" value={totalRestaked} />
        <StatsItem label="Restakers" value={restakersCount} />
      </div>

      <ValidatorSocials {...validatorSocials} />
    </Card>
  );
};

export default OperatorInfoCard;

interface StatsItemProps {
  label: string;
  value: string;
  info?: ReactNode;
}

const StatsItem: FC<StatsItemProps> = ({ label, value, info }) => {
  return (
    <div className="flex-1">
      <Typography variant="h4" fw="bold">
        {value}
      </Typography>

      <Typography variant="h5" className="text-mono-120 dark:text-mono-100">
        {label}
        {info && (
          <InfoIconWithTooltip
            className="fill-mono-120 dark:fill-mono-100"
            content={info}
          />
        )}
      </Typography>
    </div>
  );
};
