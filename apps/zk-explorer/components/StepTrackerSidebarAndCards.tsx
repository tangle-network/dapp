'use client';

import { FC, useState } from 'react';
import FeedbackCard from './FeedbackCard';
import ProofGenerationStepCards from './ProofGenerationStepCards';
import StepTrackerSidebar from './ProofGenerationStepCards/StepTrackerSidebar';

const StepTrackerSidebarAndCards: FC<{
  circuitFilename: string;
}> = ({ circuitFilename }) => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="flex gap-6 flex-col-reverse md:flex-row">
      <div className="flex flex-col gap-6 md:max-w-[391px]">
        <StepTrackerSidebar activeStep={activeStep} />

        <FeedbackCard />
      </div>

      <ProofGenerationStepCards
        circuitFilename={circuitFilename}
        activeStep={activeStep}
        nextStep={() => setActiveStep((prev) => prev + 1)}
      />
    </div>
  );
};

export default StepTrackerSidebarAndCards;
