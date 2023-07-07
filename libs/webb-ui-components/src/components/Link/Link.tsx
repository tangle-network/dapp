import { Link as ReactRouterLink } from 'react-router-dom';
import NextLink from 'next/link';
import { LinkProps } from './types';

export const Link: React.FC<LinkProps> = ({
  href,
  children,
  isNext,
  aTagProps,
  nextLinkProps,
  reactRouterLinkProps,
  ...props
}) => {
  if (!href) {
    return <>{children}</>;
  }

  const isExternal =
    href && (href.startsWith('http://') || href.startsWith('https://'));

  if (isExternal) {
    return (
      <a href={href} {...aTagProps} {...props}>
        {children}
      </a>
    );
  }

  if (isNext) {
    return (
      <NextLink href={href} {...nextLinkProps} {...props}>
        {children}
      </NextLink>
    );
  }

  return (
    <ReactRouterLink to={href} {...reactRouterLinkProps} {...props}>
      {children}
    </ReactRouterLink>
  );
};
