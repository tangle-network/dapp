import { ExternalLinkLine } from '@webb-tools/icons';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

export type ExternalLinkProps = {
  href: string;
  children: ReactNode | string;
};

const ExternalLink: FC<ExternalLinkProps> = ({ href, children }) => {
  return (
    <Button
      href={href}
      size="sm"
      variant="link"
      // TODO: Make the icon highlight on hover.
      rightIcon={<ExternalLinkLine className="dark:fill-blue-50" />}
    >
      {children}
    </Button>
  );
};

export default ExternalLink;
