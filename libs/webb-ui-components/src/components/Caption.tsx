import { FC } from 'react';
import { Typography } from '../typography';
import { ArrowRightUp } from '@webb-tools/icons';

export type CaptionProps = {
  children: string | string[];
  linkText?: string;
  linkHref?: string;
};

export const Caption: FC<CaptionProps> = ({
  children,
  linkText = 'Learn More',
  linkHref,
}) => {
  return (
    <Typography variant="body2" className="pl-2 dark:text-mono-100">
      {children}{' '}
      {linkHref !== undefined && (
        // TODO: Replace with `ExternalLink` component for consistency (it requires some tinkering to make it inline correctly).
        <a
          className="text-blue-50 dark:text-blue-50 whitespace-nowrap"
          target="_blank"
          rel="noopener noreferrer"
          href={linkHref}
        >
          {linkText}

          <ArrowRightUp className="inline fill-blue-50 dark:fill-blue-50" />
        </a>
      )}
    </Typography>
  );
};
