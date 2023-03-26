import links from '@webb-tools/dapp-config/links';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { FC, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const TwitterLink = forwardRef<HTMLAnchorElement, PropsOf<'a'>>(
  (
    {
      className,
      href = links.WEBB_TWITTER_URL,
      rel = 'noopener noreferrer',
      target = '_blank',
      children = '@webbprotocol',
      ...props
    },
    ref
  ) => {
    return (
      <a
        {...props}
        ref={ref}
        className={twMerge('link hover:underline', className)}
        href={href}
        rel={rel}
        target={target}
      >
        {children}
      </a>
    );
  }
);

TwitterLink.displayName = 'TwitterLink';

export default TwitterLink;
