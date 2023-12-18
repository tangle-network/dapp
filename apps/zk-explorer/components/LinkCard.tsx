import { PropsOf } from '@webb-tools/webb-ui-components/types';
import { PageUrl } from '../utils/utils';
import { FC } from 'react';
import { Card } from '@webb-tools/webb-ui-components';

export type LinkCardProps = PropsOf<'a'> & {
  href: PageUrl;
};

export const LinkCard: FC<PropsOf<'a'>> = (props) => {
  return (
    <a
      {...props}
      href={props.href}
      className="block hover:translate-y-[-6px] transition duration-100"
    >
      <Card className="p-6 shadow-xl items-start space-y-0">
        {props.children}
      </Card>
    </a>
  );
};
