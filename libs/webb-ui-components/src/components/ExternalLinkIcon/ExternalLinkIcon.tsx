import { ExternalLinkLine } from '@webb-tools/icons';
import { IconSize } from '@webb-tools/icons/types';
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
