import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

const SkeletonRow: FC = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <SkeletonLoader size="xl" />
      <SkeletonLoader size="xl" />
    </div>
  );
};

export default SkeletonRow;
