import { IconBase } from '@webb-tools/icons/types';

import { LogoProps } from '../Logo/types';

export type SideBarFooterProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
};

export type SidebarProps = {
  Logo: React.FC<LogoProps>;
  ClosedLogo?: React.FC<LogoProps>;
  logoLink?: string;
  items: SideBarItemProps[];
  footer: SideBarFooterProps;
  className?: string;
};

export type SideBarItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
  subItems: SideBarSubItemProps[];
};

export type SideBarExtraItemProps = {
  isSidebarOpen?: boolean;
  isActive?: boolean;
  setIsActive?: () => void;
};

export type SideBarSubItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
};

export type SideBarExtraSubItemProps = {
  isActive?: boolean;
  setItemIsActive?: () => void;
  setSubItemIsActive?: () => void;
};
