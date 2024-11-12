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
      className="group"
      href={href}
      target="_blank"
      size="sm"
      variant="link"
      rightIcon={<Icon className="fill-current dark:fill-current" />}
    >
      {children}
    </Button>
  );
};

export default ExternalLink;
