import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import './top-banner.css';

interface TopBannerProps {
  title: string;
  highlightedText: string;
  description: string;
}

const TopBanner: FC<TopBannerProps> = ({
  title,
  highlightedText,
  description,
}) => {
  return (
    <div
      className={twMerge(
        'px-6 py-9 rounded-xl bg-center bg-cover bg-no-repeat bg-top-banner',
      )}
    >
      <div className="space-y-3">
        <Typography variant="h4" className="text-mono-0">
          {title}{' '}
          <span className="text-blue-40 dark:text-blue-40">
            {highlightedText}
          </span>
        </Typography>
        <Typography variant="body1" className="text-mono-60 dark:text-mono-100">
          {description}
        </Typography>
      </div>
    </div>
  );
};

export default TopBanner;
