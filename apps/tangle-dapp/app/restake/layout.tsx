import { Metadata } from 'next';
import { FC, PropsWithChildren } from 'react';

import createPageMetadata from '../../utils/createPageMetadata';
import Providers from './providers';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Restake',
  description:
    "Explore vaults, deposit assets, and select operators to earn rewards with Tangle's restaking infrastructure.",
});

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Providers>{children}</Providers>;
};

export default RestakeLayout;
