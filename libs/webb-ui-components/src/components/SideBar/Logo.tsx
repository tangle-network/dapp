import { FC } from 'react';

import { SideBarLogoProps } from './types';

export const SideBarLogo: FC<SideBarLogoProps> = ({ logoLink, Logo }) => {
  return (
    <a href={logoLink ?? '/'} target="_blank" rel="noopener noreferrer">
      <Logo size="md" />
    </a>
  );
};
