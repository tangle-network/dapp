import { Metadata } from 'next';
import { FC, PropsWithChildren } from 'react';

import createPageMetadata from '../../utils/createPageMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Liquid Staking',
  description:
    "Liquid stake onto liquid staking pools to obtain derivative tokens and remain liquid while earning staking rewards and participating in Tangle's restaking infrastructure.",
});

const Layout: FC = ({ children }: PropsWithChildren) => {
  return children;
};

export default Layout;
