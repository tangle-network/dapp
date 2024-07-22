import { InformationLine } from '@webb-tools/icons';
import { IconWithTooltip, Typography } from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

type DetailItemProps = {
  title: string;
  tooltip?: string;
  value: ReactNode | string;
};

const DetailItem: FC<DetailItemProps> = ({ title, tooltip, value }) => {
  return (
    <div className="flex gap-2 justify-between w-full">
      <div className="flex items-center gap-1">
        <Typography variant="body1" fw="normal">
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
      ) : (
        value
      )}
    </div>
  );
};

export default DetailItem;
