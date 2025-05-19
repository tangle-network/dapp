import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const RegisteredChip: FC = () => {
  return (
    <div
      className={twMerge(
        'px-2 py-1 rounded-full border border-mono-180 dark:border-mono-80 flex items-center gap-0.5',
        'shadow-[0px_-7px_11px_0px_rgba(185,183,255,0.24)] dark:shadow-[0px_-7px_11px_0px_rgba(185,183,255,0.12)]',
      )}
    >
      <Typography variant="body4" className="text-mono-180 dark:text-mono-80">
        Registered
      </Typography>
    </div>
  );
};

export default RegisteredChip;
