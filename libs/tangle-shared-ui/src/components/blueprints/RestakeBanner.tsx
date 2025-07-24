import { ArrowRightUp } from '@tangle-network/icons';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import './top-banner.css';

export type RestakeBannerProps = {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  action?: ReactNode;
};

const RestakeBanner: FC<RestakeBannerProps> = ({
  title,
  description,
  buttonText,
  buttonHref,
  action,
}) => {
  return (
    <div
      className={twMerge(
        'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-8',
        'px-8 py-10 rounded-2xl bg-center bg-cover bg-no-repeat bg-top-banner',
        'border border-mono-40 dark:border-mono-160',
        'shadow-lg dark:shadow-xl',
        'transition-all duration-200 hover:shadow-xl dark:hover:shadow-2xl',
      )}
    >
      <div className="space-y-6 flex-1">
        <div className="space-y-4">
          <Typography 
            variant="h4" 
            className="text-mono-0 dark:text-mono-0 font-bold leading-tight drop-shadow-sm"
          >
            {title}
          </Typography>

          <Typography
            variant="body1"
            className="text-mono-20 dark:text-mono-80 leading-relaxed max-w-2xl drop-shadow-sm"
          >
            {description}
          </Typography>
        </div>

        <Button
          className="hidden sm:inline-flex font-semibold text-blue-40 dark:text-blue-50 hover:text-blue-30 dark:hover:text-blue-30"
          variant="link"
          href={buttonHref}
          target="_blank"
          rightIcon={
            <ArrowRightUp
              size="lg"
              className="fill-blue-40 dark:fill-blue-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 hover:fill-blue-30 dark:hover:fill-blue-30"
            />
          }
        >
          {buttonText}
        </Button>
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default RestakeBanner;
