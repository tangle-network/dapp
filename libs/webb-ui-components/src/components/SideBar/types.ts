import type { IconBase } from '@webb-tools/icons/types';
import type { LogoProps } from '../Logo/types';
import type { DialogContentProps } from '@radix-ui/react-dialog';
import { MouseEventHandler } from 'react';

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
  pathnameOrHash?: string;
}

export interface SideBarItemsProps {
  items: SideBarItemProps[];
  isExpanded: boolean;
  className?: string;
  pathnameOrHash?: string;
}

export type SideBarItemProps = {
  /** The item name */
  name: string;
  /** Indicate the item is next.js link */
  isNext?: boolean;
  /** If `true`, the item will be disabled */
  isDisabled?: boolean;
  /** Indicate the item is app internal link */
  isInternal: boolean;
  /** The item link */
  href: string;
  /** The item icon */
  Icon: (props: IconBase) => JSX.Element;
  /** The extra info tooltip for the item */
  info?: string | React.ReactElement;

  /** The callback function when the item is clicked */
  onClick?: MouseEventHandler<HTMLAnchorElement>;

  pathnameOrHash?: string;

  /** The item sub items */
  subItems: SideBarSubItemProps[];
};

export type SideBarExtraItemProps = {
  isExpanded?: boolean;
  isActive?: boolean;
  setIsActive?: () => void;
};

export type SideBarSubItemProps = {
  /** Sub item name */
  name: string;
  /** Indicate the item is next.js link */
  isNext?: boolean;
  /** If `true`, the item will be disabled */
  isDisabled?: boolean;
  /** Indicate the item is app internal link */
  isInternal: boolean;
  /** The item link */
  href: string;
  /** The extra info tooltip for the item */
  info?: string | React.ReactElement;

  /** The callback function when the item is clicked */
  onClick?: MouseEventHandler<HTMLAnchorElement>;

  pathnameOrHash?: string;
};

export type SideBarExtraSubItemProps = {
  isActive?: boolean;
  setItemIsActive?: () => void;
  setSubItemIsActive?: () => void;
};
