import { IconBase } from '@webb-tools/icons/types';

import { SideBarItemProps } from '../SideBarItem';
import { LogoProps } from '../Logo/types';

export type FooterProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
};

export type SidebarProps = {
  Logo: React.FC<LogoProps>;
  ClosedLogo: React.FC<LogoProps>;
  logoLink?: string;
  items: SideBarItemProps[];
  footer: FooterProps;
  className?: string;
};
