import { ExternalLinkLine } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

export type ExternalLinkProps = {
  href: string;
  children: ReactNode | string;
};

const ExternalLink: FC<ExternalLinkProps> = ({ href, children }) => {
  return (
    <a
      href={href}
      className="flex gap-1 items-center justify-center hover:underline"
    >
      {typeof children === 'string' ? (
        <Typography
          className="uppercase dark:text-blue-50"
          variant="body4"
          fw="bold"
        >
          {children}
        </Typography>
      ) : (
        children
      )}

      <ExternalLinkLine className="dark:fill-blue-50" />
    </a>
  );
};

export default ExternalLink;
