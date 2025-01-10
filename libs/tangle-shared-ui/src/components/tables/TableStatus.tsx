import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { ButtonProps } from '@webb-tools/webb-ui-components/components/buttons/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { twMerge } from 'tailwind-merge';

export type TableStatusProps = {
  icon?: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonProps?: ButtonProps;
  className?: string;
};

const GRID_BACKGROUND_CLASS = twMerge(
  'relative px-6 py-10 rounded-2xl !bg-[unset] border-mono-0 dark:border-mono-160 backdrop-blur-2xl',
  'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
  'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
  'before:absolute before:inset-0 before:bg-cover before:bg-no-repeat before:opacity-30 before:pointer-events-none',
  "before:bg-[url('/static/assets/blueprints/grid-bg.png')] dark:before:bg-[url('/static/assets/blueprints/grid-bg-dark.png')]",
);

const TableStatus = ({
  title,
  description,
  icon = '🔍',
  buttonText,
  buttonProps,
  className,
}: TableStatusProps) => {
  return (
    <div
      className={twMerge(
        'rounded-lg border border-mono-40 dark:border-mono-160',
        'bg-mono-0 dark:bg-mono-180',
        'flex flex-col items-center justify-center gap-3 p-4',
        GRID_BACKGROUND_CLASS,
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2 py-4">
        {icon}

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

      {buttonText && (
        <span className="pb-4">
          <Button {...buttonProps}>{buttonText}</Button>
        </span>
      )}
    </div>
  );
};

export default TableStatus;
