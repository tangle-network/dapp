import { ExternalLinkLine } from '@webb-tools/icons/ExternalLinkLine';
import { Chip } from '@webb-tools/webb-ui-components/components/Chip';
import InfoIconWithTooltip from '@webb-tools/webb-ui-components/components/IconWithTooltip/InfoIconWithTooltip';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../../../components/GlassCard/GlassCard';
import ValidatorSocials from '../../../../components/ValidatorSocials';
import AvatarWithText from '../../AvatarWithText';

interface Props extends Partial<ComponentProps<typeof GlassCard>> {}

const OperatorInfoCard: FC<Props> = ({ className, ...props }) => {
  const isRestaked = true;
  const accountAddress = 'tgDeWmUCK6uinvwV6qc2wCHxJboC9RAkYK79xNqeaGgp7Pp6K';
  const totalRestaked = `$0.00`;
  const restakerCount = `1`;

  const validatorSocials = {
    location: '🌎 Earth',
    twitterUrl: 'https://x.com/tangle_network',
    webUrl: 'https://tangle.tools',
    email: 'hello@webb.tools',
    githubUrl: 'https://github.com/webb-tools/tangle',
  };

  return (
    <GlassCard {...props} className={twMerge('gap-10', className)}>
      <div className="flex items-start justify-between">
        <AvatarWithText
          overrideAvatarProps={{
            size: 'lg',
          }}
          overrideTypographyProps={{
            variant: 'h4',
            fw: 'bold',
          }}
          accountAddress={accountAddress}
          identityName="NodeSync.Top"
          description={
            <div className="flex items-baseline gap-1">
              <KeyValueWithButton
                className="mt-1"
                size="sm"
                keyValue={accountAddress}
              />

              <ExternalLinkLine />
            </div>
          }
        />

        {isRestaked && <Chip color="green">Restaked</Chip>}
      </div>

      <div className="flex flex-wrap gap-4">
        <StatsItem label="Total Restake" value={totalRestaked} />
        <StatsItem label="Restakers" value={restakerCount} />
      </div>

      <ValidatorSocials {...validatorSocials} />
    </GlassCard>
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

      <Typography
        variant="h5"
        fw="normal"
        className="text-mono-120 dark:text-mono-100"
      >
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
