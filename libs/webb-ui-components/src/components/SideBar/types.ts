import type { AppEnvironment } from '@webb-tools/dapp-config/types';
import type { DialogContentProps } from '@radix-ui/react-dialog';
import type { IconBase } from '@webb-tools/icons/types';
import { ComponentProps, FunctionComponent, MouseEventHandler } from 'react';
import type { LogoProps } from '../Logo/types';

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

export interface SidebarLogoProps {
  Logo: React.FC<LogoProps>;
  logoLink?: string;
  isExpanded?: boolean;
  className?: string;
}

export interface MobileSidebarProps extends SidebarLogoProps {
  ClosedLogo?: React.FC<LogoProps>;
  items: SideBarItemProps[];
  ActionButton?: React.FC<{ isExpanded: boolean }>;
  footer: SideBarFooterType;
  className?: string;
  overrideContentProps?: DialogContentProps;
  isExpandedByDefault?: boolean;
  onSideBarToggle?: () => void;
  pathnameOrHash?: string;
}

export interface SideBarItemsProps {
  items: SideBarItemProps[];
  ActionButton?: MobileSidebarProps['ActionButton'];
  isExpanded: boolean;
  className?: string;
  pathnameOrHash?: string;
  onItemClick?: () => void;
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
  Icon: ((props: IconBase) => JSX.Element) | FunctionComponent;

  /** The extra info tooltip for the item */
  info?: string | React.ReactElement;

  /** The callback function when the item is clicked */
  onClick?: MouseEventHandler<HTMLAnchorElement>;

  pathnameOrHash?: string;
  subItems: SideBarSubItemProps[];
  hideInProduction?: boolean;
};

export type StyledSideBarItemProps = ComponentProps<'div'> &
  Pick<SideBarItemProps, 'isDisabled'> &
  Pick<SideBarExtraItemProps, 'isActive' | 'isExpanded'> & {
    subItemsCount?: number;
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

  /**
   * The environments the item is available in
   * If not provided, the item is available in all environments
   */
  environments?: AppEnvironment[];
};

export type SideBarExtraSubItemProps = {
  isActive?: boolean;
  setItemIsActive?: () => void;
  setSubItemIsActive?: () => void;
};
