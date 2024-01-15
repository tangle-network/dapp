import { Card } from '@webb-tools/webb-ui-components';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import Link from 'next/link';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

export type LinkCardProps = PropsOf<typeof Link> & {
  href: string;
  isExternal?: boolean;
};

export const LinkCard: FC<LinkCardProps> = ({
  href,
  className,
  isExternal = false,
  children,
  ...rest
}) => {
  const content = (
    <Card className="p-6 shadow-xl items-start space-y-0">{children}</Card>
  );

  const finalClassName = useMemo<string>(
    () =>
      twMerge(
        'block hover:translate-y-[-6px] transition duration-100',
        className
      ),
    [className]
  );

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    <Link {...rest} href={href} className={finalClassName}>
      {content}
    </Link>
  );
};
