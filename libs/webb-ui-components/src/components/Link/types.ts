import type { ComponentPropsWithRef } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';

type WithInternal<T> = T & {
  /**
   * Boolean if the link should be rendered as an anchor tag instead of a
   * `Link` component from `react-router-dom`.
   */
  isInternal?: boolean;
};

export type LinkProps = WithInternal<
  RouterLinkProps | ComponentPropsWithRef<'a'>
>;

function isReactRouterLinkProps(
  props: LinkProps,
): props is WithInternal<RouterLinkProps> {
  return 'to' in props && !('href' in props) && !!props.isInternal;
}

export { isReactRouterLinkProps };
