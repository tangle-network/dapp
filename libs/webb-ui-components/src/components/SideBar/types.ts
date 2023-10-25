import type { IconBase } from '@webb-tools/icons/types';
import type { LogoProps } from '../Logo/types';
import type { DialogContentProps } from '@radix-ui/react-dialog';

export type SideBarFooterType = {
  name: string;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
  useNextThemesForThemeToggle?: boolean;
};

export interface SideBarFooterProps extends SideBarFooterType {
  isExpanded: boolean;
  className?: string;
}

export interface SideBarLogoProps {
  Logo: React.FC<LogoProps>;
  logoLink?: string;
  isExpanded?: boolean;
}

export interface SidebarProps extends SideBarLogoProps {
  ClosedLogo?: React.FC<LogoProps>;
  items: SideBarItemProps[];
  footer: SideBarFooterType;
  className?: string;
  overrideContentProps?: DialogContentProps;
  isExpandedAtDefault?: boolean;
  onSideBarToggle?: () => void;
}

export interface SideBarItemsProps {
  items: SideBarItemProps[];
  isExpanded: boolean;
  className?: string;
}

export type SideBarItemProps = {
  name: string;
  isNext?: boolean;
  isInternal: boolean;
  href: string;
  Icon: (props: IconBase) => JSX.Element;
  subItems: SideBarSubItemProps[];
};

export type SideBarExtraItemProps = {
  isExpanded?: boolean;
  isActive?: boolean;
  setIsActive?: () => void;
};

export type SideBarSubItemProps = {
  name: string;
  isNext?: boolean;
  isInternal: boolean;
  href: string;
};

export type SideBarExtraSubItemProps = {
  isActive?: boolean;
  setItemIsActive?: () => void;
  setSubItemIsActive?: () => void;
};
