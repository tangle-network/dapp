import { PropsOf } from '@webb-tools/webb-ui-components/types';
import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * The generic link interface for both
 * internal and external links
 */
export interface IInternalOrExternalLink extends PropsOf<'a'> {
  /**
   * The label of the link
   */
  label: string;

  /**
   * The url of the link
   */
  url: string;

  /**
   * If true, the link will use the Next.js link component
   */
  isInternal?: boolean;
}

const InternalOrExternalLink: FC<
  PropsWithChildren<Omit<IInternalOrExternalLink, 'label'>>
> = ({ children, isInternal, url, ...props }) => {
  const className = twMerge('!text-inherit block', props.className);

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

export default InternalOrExternalLink;
