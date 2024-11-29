'use client';

import { Fragment } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { LinkProps } from './types';

interface CommonLinkProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  isInternal?: boolean;
}

type LinkProps = CommonLinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonLinkProps>;

export const Link: React.FC<LinkProps> = ({ isInternal, ...props }) => {
  const restProps = props as any; // temporary type assertion while migrating

  if (isInternal) {
    return <ReactRouterLink to={props.href ?? ''} {...restProps} />;
  }

  if (!props.href?.length) {
    return props.children;
  }

  return <a {...props}>{props.children}</a>;
};
