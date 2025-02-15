import { FC } from 'react';

import { SidebarLogoProps } from './types';

export const SideBarLogo: FC<SidebarLogoProps> = ({
  logoLink,
  Logo,
  isExpanded,
  className,
}) => {
  return (
    <a
      href={logoLink ?? '/'}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      <Logo className={!isExpanded ? 'mx-auto' : ''} size="md" />
    </a>
  );
};
