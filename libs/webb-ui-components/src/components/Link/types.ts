import { LinkProps as NextLinkProps } from 'next/link';
import { LinkProps as ReactRouterLinkProps } from 'react-router-dom';

export type LinkProps = {
  href: string;
  children: React.ReactNode;
  isNext?: boolean;
  aTagProps?: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  nextLinkProps?: Omit<NextLinkProps, 'href'>;
  reactRouterLinkProps?: Omit<ReactRouterLinkProps, 'to'>;
};
