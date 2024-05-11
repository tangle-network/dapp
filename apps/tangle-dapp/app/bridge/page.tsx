import { Metadata } from 'next';
import { FC } from 'react';

import createPageMetadata from '../../utils/createPageMetadata';
import BridgeContainer from './BridgeContainer';

export const metadata: Metadata = createPageMetadata({
  title: 'Bridge',
});

const Bridge: FC = () => {
  return (
    <div>
      <BridgeContainer className="mx-auto" />
    </div>
  );
};

export default Bridge;
