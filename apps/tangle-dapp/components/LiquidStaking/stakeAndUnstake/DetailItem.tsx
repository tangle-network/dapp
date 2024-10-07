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

import ExternalLink from '../ExternalLink';

type DetailItemProps = {
  title: string;
  tooltip?: string;
  value: Error | ReactNode | string | null;
};

const DetailItem: FC<DetailItemProps> = ({ title, tooltip, value }) => {
  return (
    <div className="flex gap-2 justify-between w-full">
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
            overrideTooltipBodyProps={{
              className: 'max-w-[350px]',
            }}
          />
        )}
      </div>

      {typeof value === 'string' ? (
        <Typography className="dark:text-mono-0" variant="body1" fw="bold">
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
