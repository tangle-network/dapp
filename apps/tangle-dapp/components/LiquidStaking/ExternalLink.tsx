import { ExternalLinkLine } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import { Button } from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';

export type ExternalLinkProps = {
  href: string;
  children: ReactNode | string;
  Icon?: (props: IconBase) => ReactNode;
};

const ExternalLink: FC<ExternalLinkProps> = ({
  href,
  children,
  Icon = ExternalLinkLine,
}) => {
  return (
    <Button
      href={href}
      size="sm"
      variant="link"
      // TODO: Make the icon highlight on hover.
      rightIcon={<Icon className="dark:fill-blue-50" />}
    >
      {children}
    </Button>
  );
};

export default ExternalLink;
