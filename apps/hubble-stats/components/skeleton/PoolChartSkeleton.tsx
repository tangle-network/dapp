import { FC } from 'react';

import ContainerSkeleton from './ContainerSkeleton';

const PoolChartSkeleton: FC = () => {
  return <ContainerSkeleton numOfRows={1} className="min-h-[284px]" />;
};

export default PoolChartSkeleton;
