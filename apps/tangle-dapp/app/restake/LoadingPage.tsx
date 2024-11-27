import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { Card } from '@webb-tools/webb-ui-components/components/Card';
import { FC } from 'react';

import StyleContainer from './StyleContainer';

const LoadingPage: FC = () => {
  return (
    <StyleContainer>
      <SkeletonLoader className="w-full mb-4 h-11 rounded-xl" />

      <Card withShadow className="space-y-2">
        <SkeletonLoader className="w-full h-36 rounded-xl" />
      </Card>
    </StyleContainer>
  );
};

export default LoadingPage;
