import type { ComponentPropsWithoutRef } from 'react';
import { Link as ReactRouterLink } from 'react-router';

type WithInternal<T> = T & {
  /**
   * Boolean if the link should be rendered as an anchor tag instead of a
   * `Link` component from `react-router` or `next/link`.
   */
  isInternal?: boolean;
};

export type LinkProps = WithInternal<
  | ComponentPropsWithoutRef<typeof ReactRouterLink>
  | ComponentPropsWithoutRef<'a'>
>;

function isReactRouterLinkProps(
  props: LinkProps,
): props is WithInternal<ComponentPropsWithoutRef<typeof ReactRouterLink>> {
  return 'to' in props && !('href' in props) && !!props.isInternal;
}

export { isReactRouterLinkProps };
