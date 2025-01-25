import { InformationLine } from '@webb-tools/icons';
import {
  Chip,
  GITHUB_BUG_REPORT_URL,
  IconWithTooltip,
  InfoIconWithTooltip,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import ExternalLink from '../../ExternalLink';

type DetailItemProps = {
  title: string;
  tooltip?: string;
  value: Error | ReactNode | string | null;
  className?: string;
};

const DetailItem: FC<DetailItemProps> = ({
  title,
  tooltip,
  value,
  className,
}) => {
  return (
    <div className="flex justify-between w-full gap-2">
      <div className="flex items-center gap-1">
        <Typography variant="body2" fw="normal">
          {title}
        </Typography>

        {tooltip !== undefined && (
          <IconWithTooltip
            icon={
              <InformationLine className="fill-mono-140 dark:fill-mono-100" />
            }
            content={tooltip}
          />
        )}
      </div>

      {typeof value === 'string' ? (
        <Typography
          className={twMerge('dark:text-mono-0', className)}
          variant="body1"
          fw="bold"
        >
          {value}
        </Typography>
      ) : value === null ? (
        <SkeletonLoader className="max-w-[80px]" />
      ) : value instanceof Error ? (
        <ErrorChip error={value} />
      ) : (
        value
      )}
    </div>
  );
};

/** @internal */
const ErrorChip: FC<{ error: Error }> = ({ error }) => {
  return (
    <Chip color="red">
      Error{' '}
      <InfoIconWithTooltip
        className="dark:fill-red-400 fill-red-400"
        content={
          <>
            <Typography variant="body1">
              {error.name}: {error.message}
            </Typography>

            <ExternalLink href={GITHUB_BUG_REPORT_URL}>
              Report issue
            </ExternalLink>
          </>
        }
      />
    </Chip>
  );
};

export default DetailItem;
