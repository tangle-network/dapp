import { ArrowRightUp } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
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
        'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-9 px-6 py-9 rounded-xl bg-center bg-cover bg-no-repeat bg-top-banner',
      )}
    >
      <div className="max-w-[600px] space-y-4">
        <div className="space-y-3">
          <Typography variant="h4" className="text-mono-0">
            {title}
          </Typography>

          <Typography
            variant="body1"
            className="text-mono-60 dark:text-mono-100"
          >
            {description}
          </Typography>
        </div>

        <Button
          className="hidden sm:flex"
          variant="link"
          href={buttonHref}
          target="_blank"
          rightIcon={
            <ArrowRightUp
              size="lg"
              className="fill-current dark:fill-current"
            />
          }
        >
          {buttonText}
        </Button>
      </div>

      {action}
    </div>
  );
};

export default RestakeBanner;
