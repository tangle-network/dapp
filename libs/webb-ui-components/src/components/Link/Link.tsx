import { Link as ReactRouterLink } from 'react-router-dom';
import NextLink from 'next/link';
import { LinkProps, isNextLinkProps, isReactRouterLinkProps } from './types';
import { Fragment } from 'react';

export const Link: React.FC<LinkProps> = (props) => {
  if (isNextLinkProps(props)) {
    return <NextLink {...props} />;
  }

  if (isReactRouterLinkProps(props)) {
    return <ReactRouterLink {...props} />;
  }

  if (!props.href?.length) {
    return <Fragment key={props.key}>{props.children}</Fragment>;
  }

  return <a {...props} />;
};
