import { ExternalLinkLine } from '@tangle-network/icons';
import { IconSize } from '@tangle-network/icons/types';
import { ComponentProps, FC } from 'react';

interface ExternalLinkIconProps extends ComponentProps<'a'> {
  href: string;
  size?: IconSize;
  className?: string;
}

const ExternalLinkIcon: FC<ExternalLinkIconProps> = ({
  href,
  size = 'md',
  className,
  ...props
}) => {
  return (
    <a {...props} href={href} target="_blank" rel="noopener noreferrer">
      <ExternalLinkLine size={size} className={className} />
    </a>
  );
};

export default ExternalLinkIcon;
