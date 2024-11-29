import { FC, PropsWithChildren } from 'react';
import { Helmet } from 'react-helmet-async';

const pageConfig = {
  title: 'Liquid Staking',
  metadata: {
    title: 'Liquid Staking | Tangle Network',
    description:
      "Liquid stake onto liquid staking pools to obtain LSTs and remain liquid while earning staking rewards and participating in Tangle's restaking infrastructure.",
    openGraph: {
      title: 'Liquid Staking | Tangle Network',
      description:
        "Liquid stake onto liquid staking pools to obtain LSTs and remain liquid while earning staking rewards and participating in Tangle's restaking infrastructure.",
    },
  },
};

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
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
    </>
  );
};

export default Layout;
