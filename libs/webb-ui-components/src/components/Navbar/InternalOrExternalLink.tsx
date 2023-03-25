import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

import { InternalOrExternalLinkProps } from './types';

export const InternalOrExternalLink: FC<
  PropsWithChildren<Omit<InternalOrExternalLinkProps, 'label'>>
> = ({ children, isInternal, url, ...props }) => {
  const className = twMerge('text-inherit block', props.className);

  return isInternal ? (
    <Link {...props} href={url} className={className}>
      {children}
    </Link>
  ) : (
    <a href={url} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
};
