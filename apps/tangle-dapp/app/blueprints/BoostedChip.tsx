import { SparklingIcon } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
BoostedChip
const : FC = () => {
  return (
    <div
      className={twMerge(
        'px-2 py-1 rounded-full border border-purple-50 flex items-center gap-0.5',
        'shadow-[0px_-7px_11px_0px_rgba(185,183,255,0.24)] dark:shadow-[0px_-7px_11px_0px_rgba(185,183,255,0.12)]',
      )}
    >
      <SparklingIcon className="fill-purple-60 dark:fill-purple-40" />
      <Typography
        variant="body4"
        className="text-purple-60 dark:text-purple-40"
      >
        Boosted
      </Typography>
    </div>
  );
};

export default BoostedChip;
