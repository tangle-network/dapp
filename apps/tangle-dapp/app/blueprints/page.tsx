import { Metadata } from 'next';
import { FC } from 'react';

import createPageMetadata from '../../utils/createPageMetadata';

export const dynamic = 'force-static';

export const metadata: Metadata = createPageMetadata({
  title: 'Blueprints',
});

const BlueprintsPage: FC = () => {
  return <div>BlueprintsPage</div>;
};

export default BlueprintsPage;
