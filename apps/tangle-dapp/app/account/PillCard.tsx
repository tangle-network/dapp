import { IconBase } from '@webb-tools/icons/types';
import {
  Card,
  SkeletonLoader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type PillCardProps = {
  isFirst?: boolean;
  isLast?: boolean;
  title: string;
  Icon: FC<IconBase>;

  /**
   * The value to display as a string.
   *
   * @remarks
   * If `null`, the value will be displayed as a skeleton loader
   * to indicate that the value is loading.
   */
  value: string | null;
};

const PillCard: FC<PillCardProps> = ({
  title,
  value,
  Icon,
  isFirst = false,
  isLast = false,
}) => {
  const firstBorderClass = isFirst ? 'rounded-l-2xl' : '';
  const lastBorderClass = isLast ? 'rounded-r-2xl' : 'border-r';

  return (
    <Card
      style={{
        background:
          'linear-gradient(180deg, #2B2F40 0%, rgba(43, 47, 64, 0.00) 100%)',
      }}
      className={twMerge(
        'space-y-0 rounded-none border border-mono-160',
        firstBorderClass,
        lastBorderClass
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <Typography variant="body1" fw="normal">
            {title}
          </Typography>

          <Icon size="lg" />
        </div>

        <Typography variant="h4" fw="bold">
          {value !== null ? value : <SkeletonLoader size="lg" />}
        </Typography>
      </div>
    </Card>
  );
};

export default PillCard;
