import React, { FC, ReactNode } from 'react';

import AllocationChart, { AllocationChartProps } from './AllocationChart';

export interface AllocationStepContainerProps extends AllocationChartProps {
  children: ReactNode;
}

const AllocationStepContainer: FC<AllocationStepContainerProps> = ({
  children,
  ...allocationChartProps
}) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-5 items-center sm:items-start justify-center">
      <div className="w-full flex flex-col gap-4 items-center justify-start min-w-max">
        {children}
      </div>

      <div className="w-full">
        <AllocationChart {...allocationChartProps} />
      </div>
    </div>
  );
};

export default AllocationStepContainer;
