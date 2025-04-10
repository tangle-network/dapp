import SkeletonLoader from '@tangle-network/ui-components/components/SkeletonLoader';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';
import type { ComponentProps, FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type StatsItemProps = ComponentProps<'div'> & {
  displayLabelBottom?: boolean;
  result: string | number | null;
  isLoading: boolean;
  error: Error | null;
  label: string;
  labelClassName?: string;
  valueClassName?: string;
};

export const StatsItem: FC<StatsItemProps> = ({
  displayLabelBottom,
  error,
  isLoading,
  label,
  result,
  labelClassName,
  valueClassName,
  ...restProps
}) => (
  <div
    {...restProps}
    className={twMerge(isLoading && 'space-y-2', restProps.className)}
  >
    {!displayLabelBottom && (
      <Typography
        variant="body1"
        className={twMerge('text-mono-120 dark:text-mono-100', labelClassName)}
      >
        {label}
      </Typography>
    )}
    {isLoading ? (
      <SkeletonLoader className="w-full max-w-20 h-10" />
    ) : (
      <Typography
        variant="h4"
        fw="bold"
        className={twMerge('text-mono-200 dark:text-mono-0', valueClassName)}
      >
        {error
          ? error.name
          : result
            ? typeof result === 'number'
              ? addCommasToNumber(result)
              : result
            : EMPTY_VALUE_PLACEHOLDER}
      </Typography>
    )}
    {displayLabelBottom && (
      <Typography
        variant="body1"
        className={twMerge('text-mono-120 dark:text-mono-100', labelClassName)}
      >
        {label}
      </Typography>
    )}
  </div>
);
