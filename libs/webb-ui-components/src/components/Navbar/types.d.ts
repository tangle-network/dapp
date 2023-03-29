import { ComponentProps } from 'react';
import { PropsOf } from '../../types';
import { Button } from '../Button';

/**
 * The generic link interface for both
 * internal and external links
 */
export interface InternalOrExternalLinkProps extends PropsOf<'a'> {
  /**
   * The label of the link
   */
  label: string;

  /**
   * The url of the link
   */
  url: string;

  /**
   * If true, the link will use the Next.js link component
   */
  isInternal?: boolean;
}

export type NavItemType = InternalOrExternalLinkProps;

export interface NavbarProps extends PropsOf<'nav'> {
  /**
   * The navigation items array to render
   * item can be `NavItemType` or
   * an object with label and an array of `NavItemType`
   * to display as the dropdown component
   */
  navItems?: Array<NavItemType | { [label: string]: Array<NavItemType> }>;

  /**
   * An additional buttons to render
   */
  buttonProps?: Array<ComponentProps<typeof Button>>;
}

export interface MobileNavProps {
  /**
   * The navigation items array to render
   */
  navItems?: Array<NavItemType | { [label: string]: Array<NavItemType> }>;
}
