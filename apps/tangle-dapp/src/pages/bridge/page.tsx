import { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { PageLayout } from '@/components/layout/PageLayout';
import BridgeContainer from './BridgeContainer';

const pageConfig = {
  title: 'Bridge',
  metadata: {
    title: 'Bridge | Tangle Network',
    description: 'Bridge assets across different networks with Tangle Network',
    openGraph: {
      title: 'Bridge | Tangle Network',
      description:
        'Bridge assets across different networks with Tangle Network',
    },
  },
};

const Bridge: FC = () => {
  return (
    <PageLayout title={pageConfig.title} metadata={pageConfig.metadata}>
      <BridgeContainer className="mx-auto" />
    </PageLayout>
  );
};

export default Bridge;
