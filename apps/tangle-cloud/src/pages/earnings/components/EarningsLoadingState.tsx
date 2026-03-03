import { FC } from 'react';
import {
  Card,
  CardVariant,
  SkeletonLoader,
} from '@tangle-network/ui-components';

const EarningsLoadingState: FC = () => {
  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <SkeletonLoader className="h-10 w-64 mb-4" />
      <SkeletonLoader className="h-8 w-full mb-2" />
      <SkeletonLoader className="h-8 w-11/12 mb-2" />
      <SkeletonLoader className="h-8 w-10/12" />
    </Card>
  );
};

export default EarningsLoadingState;
