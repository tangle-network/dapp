import NextLink from 'next/link';
import type { ComponentPropsWithoutRef } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

export type LinkProps = (
  | ComponentPropsWithoutRef<typeof NextLink>
  | ComponentPropsWithoutRef<typeof ReactRouterLink>
  | ComponentPropsWithoutRef<'a'>
) & {
  /**
   * Boolean if the link should be rendered as an anchor tag instead of a
   * `Link` component from `react-router-dom` or `next/link`.
   */
  isInternal?: boolean;
};

function isNextLinkProps(
  props: LinkProps
): props is ComponentPropsWithoutRef<typeof NextLink> {
  return 'href' in props && !('to' in props) && !!props.isInternal;
}

function isReactRouterLinkProps(
  props: LinkProps
): props is ComponentPropsWithoutRef<typeof ReactRouterLink> {
  return 'to' in props && !('href' in props) && !!props.isInternal;
}

export { isNextLinkProps, isReactRouterLinkProps };
