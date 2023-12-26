import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { PageUrl } from '../utils/utils';
import { FC } from 'react';
import { Card } from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

export type LinkCardProps = PropsOf<'a'> & {
  href: PageUrl;
};

export const LinkCard: FC<PropsOf<typeof Link>> = ({
  href,
  className,
  children,
  ...rest
}) => {
  return (
    <Link
      {...rest}
      href={href}
      className={twMerge(
        'block hover:translate-y-[-6px] transition duration-100',
        className
      )}
    >
      <Card className="p-6 shadow-xl items-start space-y-0">{children}</Card>
    </Link>
  );
};
