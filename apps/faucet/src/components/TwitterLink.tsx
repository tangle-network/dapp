import { FOLLOW_WEBB_TWITTER_URL } from '@webb-tools/webb-ui-components/constants';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const TwitterLink = forwardRef<
  HTMLAnchorElement,
  PropsOf<'a'> & { isInheritFont?: boolean }
>(
  (
    {
      className,
      href = FOLLOW_WEBB_TWITTER_URL,
      rel = 'noopener noreferrer',
      target = '_blank',
      children = '@webbprotocol',
      isInheritFont,
      ...props
    },
    ref,
  ) => {
    return (
      <a
        {...props}
        ref={ref}
        className={twMerge(
          'text-blue-70 hover:underline font-bold',
          cx({ 'mkt-body1': !isInheritFont }),
          className,
        )}
        href={href}
        rel={rel}
        target={target}
      >
        {children}
      </a>
    );
  },
);

TwitterLink.displayName = 'TwitterLink';

export default TwitterLink;
