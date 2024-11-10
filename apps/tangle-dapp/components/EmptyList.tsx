import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type EmptyListProps = {
  className?: string;
  title: string;
  description: string;
};

const EmptyList: FC<EmptyListProps> = ({ title, description, className }) => {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center',
        className,
      )}
    >
      🔍
      <Typography
        variant="h5"
        fw="bold"
        className="text-center text-mono-200 dark:text-mono-0"
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        fw="semibold"
        className="max-w-2xl text-center text-mono-120 dark:text-mono-80"
      >
        {description}
      </Typography>
    </div>
  );
};

export default EmptyList;
