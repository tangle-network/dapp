import { FC, PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';

import Providers from './providers';

const pageConfig = {
  title: 'Restake',
  metadata: {
    title: 'Restake | Tangle Network',
    description:
      "Explore vaults, deposit assets, and select operators to earn rewards with Tangle's restaking infrastructure.",
    openGraph: {
      title: 'Restake | Tangle Network',
      description:
        "Explore vaults, deposit assets, and select operators to earn rewards with Tangle's restaking infrastructure.",
    },
  },
};

const RestakeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Providers>
      <Helmet>
        <title>{pageConfig.metadata.title}</title>
        <meta name="description" content={pageConfig.metadata.description} />
        <meta
          property="og:title"
          content={pageConfig.metadata.openGraph.title}
        />
        <meta
          property="og:description"
          content={pageConfig.metadata.openGraph.description}
        />
      </Helmet>
      {children}
    </Providers>
  );
};

export default RestakeLayout;
