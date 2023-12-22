import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { PageUrl } from '../utils/utils';
import { FC } from 'react';
import { Card } from '@webb-tools/webb-ui-components';
import Link from 'next/link';

export type LinkCardProps = PropsOf<'a'> & {
  href: PageUrl;
};

export const LinkCard: FC<PropsOf<typeof Link>> = (props) => {
  return (
    <Link
      {...props}
      href={props.href}
      className="block hover:translate-y-[-6px] transition duration-100"
    >
      <Card className="p-6 shadow-xl items-start space-y-0">
        {props.children}
      </Card>
    </Link>
  );
};
