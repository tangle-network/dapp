import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Card } from '@webb-tools/webb-ui-components/components/Card';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';
import { FC } from 'react';

import RestakeTabs from './RestakeTabs';
import StyleContainer from './StyleContainer';

const LoadingPage: FC = () => {
  return (
    <StyleContainer>
      <RestakeTabs />

      <Card withShadow className="space-y-4">
        <SkeletonLoader className="w-full h-36 rounded-xl" />

        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <SkeletonLoader className="flex-none w-20 h-6 rounded-xl" />

            <SkeletonLoader className="flex-none w-12 h-6 rounded-xl" />
          </div>

          <div className="flex items-center justify-between">
            <SkeletonLoader className="flex-none w-20 h-6 rounded-xl" />

            <SkeletonLoader className="flex-none w-12 h-6 rounded-xl" />
          </div>
        </div>

        <Button isFullWidth isLoading loadingText="Loading...">
          Loading...
        </Button>
      </Card>
    </StyleContainer>
  );
};

export default LoadingPage;
