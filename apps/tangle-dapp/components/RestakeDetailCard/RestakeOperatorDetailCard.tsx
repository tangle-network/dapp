'use client';

import GlobalLine from '@webb-tools/icons/GlobalLine';
import { Mail } from '@webb-tools/icons/Mail';
import MapPinLine from '@webb-tools/icons/MapPinLine';
import { TwitterFill } from '@webb-tools/icons/TwitterFill';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { Chip } from '@webb-tools/webb-ui-components/components/Chip';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import { cloneElement, ReactElement } from 'react';

import RestakeDetailCard from './index';
import { getDisplayValue } from './utils';

type RestakeOperatorDetailCardProps = {
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

const RestakeOperatorDetailCard = ({
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
}: RestakeOperatorDetailCardProps) => {
  return (
    <RestakeDetailCard.Root>
      <RestakeDetailCard.Header
        IconElement={
          <Avatar size="lg" value={operatorAccountId} theme="substrate" />
        }
        RightElement={
          isDelegated ? <Chip color="green">DELEGATED</Chip> : undefined
        }
        title={identityName || shortenString(operatorAccountId ?? '')}
        description={
          <KeyValueWithButton
            size="sm"
            shortenFn={shortenString}
            keyValue={operatorAccountId}
          />
        }
        descExternalLink={validatorExternalLink}
      />

      <RestakeDetailCard.Body>
        <RestakeDetailCard.Item title="Total Staked">
          {getDisplayValue(totalStaked)}
        </RestakeDetailCard.Item>

        <RestakeDetailCard.Item title="Delegators">
          {getDisplayValue(delegationCount)}
        </RestakeDetailCard.Item>
      </RestakeDetailCard.Body>

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
    </RestakeDetailCard.Root>
  );
};

export default RestakeOperatorDetailCard;

const SocialLink = ({ href, Icon }: { href?: string; Icon: ReactElement }) => {
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
