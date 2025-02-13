import { ExternalLinkLine } from '@tangle-network/icons';
import { IconSize } from '@tangle-network/icons/types';
import { FC } from 'react';

interface ExternalLinkIconProps {
  href: string;
  size?: IconSize;
  className?: string;
}

const ExternalLinkIcon: FC<ExternalLinkIconProps> = ({
  href,
  size = 'md',
  className,
}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <ExternalLinkLine size={size} className={className} />
    </a>
  );
};

export default ExternalLinkIcon;
