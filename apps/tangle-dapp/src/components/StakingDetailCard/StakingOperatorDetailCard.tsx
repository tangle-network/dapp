import GlobalLine from '@tangle-network/icons/GlobalLine';
import { Mail } from '@tangle-network/icons/Mail';
import MapPinLine from '@tangle-network/icons/MapPinLine';
import { TwitterFill } from '@tangle-network/icons/TwitterFill';
import { Avatar } from '@tangle-network/ui-components/components/Avatar';
import { Chip } from '@tangle-network/ui-components/components/Chip';
import { KeyValueWithButton } from '@tangle-network/ui-components/components/KeyValueWithButton';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import { cloneElement, FC, ReactElement } from 'react';
import StakingDetailCard from './index';
import getDisplayValue from './utils';

type Props = {
  delegationCount?: number;
  identityEmailLink?: string;
  identityName?: string;
  identityWebLink?: string;
  identityXLink?: string;
  isDelegated?: boolean;
  operatorAccountId?: string;
  totalStaked?: string | number;
  validatorExternalLink?: string;
  location?: string;
};

const StakingOperatorDetailCard: FC<Props> = ({
  delegationCount,
  identityEmailLink,
  identityName,
  identityXLink,
  identityWebLink,
  isDelegated,
  operatorAccountId = '',
  totalStaked,
  validatorExternalLink,
  location = 'Unknown',
}) => {
  return (
    <StakingDetailCard.Root>
      <StakingDetailCard.Header
        IconElement={
          <Avatar size="lg" value={operatorAccountId} theme="substrate" />
        }
        RightElement={
          isDelegated ? <Chip color="green">DELEGATED</Chip> : undefined
        }
        title={identityName || shortenString(operatorAccountId ?? '')}
        description={
          <KeyValueWithButton size="sm" keyValue={operatorAccountId} />
        }
        descExternalLink={validatorExternalLink}
      />

      <StakingDetailCard.Body>
        <StakingDetailCard.Item title="Total Staked">
          {getDisplayValue(totalStaked)}
        </StakingDetailCard.Item>

        <StakingDetailCard.Item title="Delegators">
          {getDisplayValue(delegationCount)}
        </StakingDetailCard.Item>
      </StakingDetailCard.Body>

      <div className="flex items-center justify-between">
        <div className="flex items-center self-start gap-2">
          {identityXLink && (
            <SocialLink href={identityXLink} Icon={<TwitterFill />} />
          )}

          {identityEmailLink && (
            <SocialLink href={identityEmailLink} Icon={<Mail />} />
          )}

          {identityWebLink && (
            <SocialLink href={identityWebLink} Icon={<GlobalLine />} />
          )}
        </div>

        <Chip color="dark-grey" className="flex items-center self-end gap-2">
          <MapPinLine className="!fill-current" />

          {location}
        </Chip>
      </div>
    </StakingDetailCard.Root>
  );
};

export default StakingOperatorDetailCard;

const SocialLink: FC<{ href?: string; Icon: ReactElement }> = ({
  href,
  Icon,
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-mono-120 dark:text-mono-100"
    >
      <Chip color="dark-grey">
        {cloneElement(Icon, { className: '!fill-current' })}
      </Chip>
    </a>
  );
};
