'use client';

import { forwardRef, Fragment } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import { LinkProps, isReactRouterLinkProps } from './types';

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  if (isReactRouterLinkProps(props)) {
    return <ReactRouterLink ref={ref} {...extractInternalProp(props)} />;
  }

  if (!props.href?.length) {
    return <Fragment key={props.key}>{props.children}</Fragment>;
  }

  const internalProps = extractInternalProp(props);

  return <a ref={ref} {...internalProps}>{internalProps.children}</a>;
});
Link.displayName = 'Link';

function extractInternalProp<T extends LinkProps>(
  props: T,
): Omit<T, 'isInternal'> {
  const { isInternal, ...restProps } = props;
  return restProps;
}
