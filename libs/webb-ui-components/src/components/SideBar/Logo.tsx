import { FC } from 'react';

import { SideBarLogoProps } from './types';

export const SideBarLogo: FC<SideBarLogoProps> = ({
  logoLink,
  Logo,
  isExpanded,
}) => {
  return (
    <a href={logoLink ?? '/'} target="_blank" rel="noopener noreferrer">
      <Logo className={!isExpanded ? 'mx-auto' : ''} size="md" />
    </a>
  );
};
