import { IconBase } from '@webb-tools/icons/types';
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
  items: ItemProps[];
  footer: FooterProps;
};

export type ItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
  subItems: SubItemProps[];
};

export type ExtraItemProps = {
  isSidebarOpen?: boolean;
  isActive?: boolean;
  setIsActive?: () => void;
};

export type SubItemProps = {
  name: string;
  isInternal: boolean;
  href: string;
};

export type ExtraSubItemProps = {
  isActive?: boolean;
  setItemIsActive?: () => void;
  setSubItemIsActive?: () => void;
};
