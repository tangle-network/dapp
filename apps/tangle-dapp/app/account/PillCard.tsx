import { IconBase } from '@webb-tools/icons/types';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../components/GlassCard/GlassCard';

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
  const firstBorderClass = isFirst
    ? 'rounded-t-2xl md:rounded-none md:rounded-l-2xl'
    : '';

  const lastBorderClass = isLast
    ? 'rounded-b-2xl md:rounded-none md:rounded-r-2xl'
    : 'border-b md:border-r';

  return (
    <GlassCard
      className={twMerge('rounded-none', firstBorderClass, lastBorderClass)}
    >
      <div className="flex flex-col gap-2">
        <div className="flex justify-between gap-2">
          <Typography variant="body1" fw="normal">
            {title}
          </Typography>

          <Icon size="lg" />
        </div>

        <Typography variant="h4" fw="bold">
          {value !== null ? value : <SkeletonLoader size="lg" />}
        </Typography>
      </div>
    </GlassCard>
  );
};

export default PillCard;
