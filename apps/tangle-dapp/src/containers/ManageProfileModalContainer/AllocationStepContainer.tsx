import { FC, ReactNode } from 'react';

import AllocationChart, { AllocationChartProps } from './AllocationChart';

export interface AllocationStepContainerProps extends AllocationChartProps {
  children: ReactNode;
}

const AllocationStepContainer: FC<AllocationStepContainerProps> = ({
  children,
  ...allocationChartProps
}) => {
  return (
    <div className="flex flex-col-reverse items-center justify-center gap-5 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center justify-start w-full gap-4 min-w-max">
        {children}
      </div>

      <div className="w-full">
        <AllocationChart {...allocationChartProps} />
      </div>
    </div>
  );
};

export default AllocationStepContainer;
