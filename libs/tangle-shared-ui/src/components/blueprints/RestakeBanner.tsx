import { ArrowRight } from '@webb-tools/icons';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import './top-banner.css';

export type RestakeBannerProps = {
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
};

const RestakeBanner: FC<RestakeBannerProps> = ({
  title,
  description,
  buttonText,
  buttonHref,
}) => {
  return (
    <div
      className={twMerge(
        'px-6 py-9 rounded-xl bg-center bg-cover bg-no-repeat bg-top-banner',
      )}
    >
      <div className="max-w-[500px] space-y-6">
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
          variant="link"
          href={buttonHref}
          target="_blank"
          rightIcon={
            <ArrowRight size="lg" className="fill-current dark:fill-current" />
          }
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

export default RestakeBanner;
