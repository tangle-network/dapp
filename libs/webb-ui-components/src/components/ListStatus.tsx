import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../typography';

export type ListStatusProps = {
  emoji?: string;
  className?: string;
  title: string;
  description?: string;
};

export const ListStatus: FC<ListStatusProps> = ({
  emoji = '🔍',
  title,
  description,
  className,
}) => {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center gap-1',
        className,
      )}
    >
      <span role="img" aria-label={title}>
        {emoji}
      </span>

      <Typography
        variant="h5"
        fw="bold"
        className="text-center text-mono-200 dark:text-mono-0"
      >
        {title}
      </Typography>

      {description !== undefined && (
        <Typography
          variant="body1"
          fw="semibold"
          className="max-w-[480px] text-center text-mono-120 dark:text-mono-80"
        >
          {description}
        </Typography>
      )}
    </div>
  );
};
