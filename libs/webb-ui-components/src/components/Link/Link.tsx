'use client';

import NextLink from 'next/link';
import { Fragment } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import { LinkProps, isNextLinkProps, isReactRouterLinkProps } from './types';

export const Link: React.FC<LinkProps> = (props) => {
  if (isNextLinkProps(props)) {
    return <NextLink {...extractInternalProp(props)} />;
  }

  if (isReactRouterLinkProps(props)) {
    return <ReactRouterLink {...extractInternalProp(props)} />;
  }

  if (!props.href?.length) {
    return <Fragment key={props.key}>{props.children}</Fragment>;
  }

  const internalProps = extractInternalProp(props);

  return <a {...internalProps}>{internalProps.children}</a>;
};

function extractInternalProp<T extends LinkProps>(
  props: T,
): Omit<T, 'isInternal'> {
  const { isInternal, ...restProps } = props;
  return restProps;
}
