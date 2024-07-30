import { Metadata } from 'next';
import { FC } from 'react';

import createPageMetadata from '../../utils/createPageMetadata';
import TopBanner from './TopBanner';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Blueprints',
});

const BlueprintsPage: FC = () => {
  return (
    <div className="space-y-5">
      <TopBanner />
    </div>
  );
};

export default BlueprintsPage;
