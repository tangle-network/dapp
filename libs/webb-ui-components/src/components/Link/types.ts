import { LinkProps as InternalLinkProps } from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

type WithInternal<T> = T & {
  /**
   * Boolean if the link should be rendered as an anchor tag instead of a
   * `Link` component from `react-router-dom` or `next/link`.
   */
  isInternal?: boolean;
};

type NextLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof InternalLinkProps
> &
  InternalLinkProps & {
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>;

export type LinkProps = WithInternal<
  | NextLinkProps
  | ComponentPropsWithoutRef<typeof ReactRouterLink>
  | ComponentPropsWithoutRef<'a'>
>;

function isNextLinkProps(
  props: LinkProps,
): props is WithInternal<NextLinkProps> {
  return 'href' in props && !('to' in props) && !!props.isInternal;
}

function isReactRouterLinkProps(
  props: LinkProps,
): props is WithInternal<ComponentPropsWithoutRef<typeof ReactRouterLink>> {
  return 'to' in props && !('href' in props) && !!props.isInternal;
}

export { isNextLinkProps, isReactRouterLinkProps };
