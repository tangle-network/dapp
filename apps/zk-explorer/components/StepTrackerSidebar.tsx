'use client';

import { Card, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type StepTrackerSidebarProps = {
  activeStep: number;
};

export const StepTrackerSidebar: FC<StepTrackerSidebarProps> = ({
  activeStep,
}) => {
  return (
    <div className="flex gap-6 rounded-2xl">
      <Card className="flex flex-col space-y-0">
        <Typography variant="h5" fw="bold" className="mb-4">
          Circuit Setup
        </Typography>

        <StepTrackerItem
          number={1}
          activeStep={activeStep}
          title="Process R1CS File"
          description="Upload and validate your R1CS file to establish the Rank-1
              Constraint System, which is essential for defining your
              circuit's behavior."
        />

        <StepTrackerItem
          number={2}
          activeStep={activeStep}
          title="Upload Verification Key"
          description="Provide the Verification Key to enable the verification process of zero-knowledge proofs generated for your circuit."
        />

        <StepTrackerItem
          number={3}
          activeStep={activeStep}
          title="Upload Proving Key"
          description="Supply the Proving Key necessary for generating zero-knowledge
              proofs, assuring that computations follow your circuit's logic."
        />

        <StepTrackerItem
          number={4}
          activeStep={activeStep}
          title="Select MPC Participants"
          description="Select the multi-party computation participants who will execute
              the proof generation for your circuit."
        />

        <StepTrackerItem
          number={5}
          activeStep={activeStep}
          isLast
          title="Select Service Tier"
          description="Select a service level that meets your computational and
              throughput requirements, ensuring seamless proof generation
              through provided API."
        />
      </Card>
    </div>
  );
};

type VerticalStepperItemProps = {
  number: number;
  isActive?: boolean;
  isComplete?: boolean;
  isLast?: boolean;
};

type StepTrackerItemProps = {
  number: number;
  title: string;
  description: string;
  activeStep: number;
  isLast?: boolean;
};

/** @internal */
const StepTrackerItem: FC<StepTrackerItemProps> = ({
  title,
  description,
  number,
  activeStep,
  isLast,
}) => {
  const isComplete = number < activeStep;
  const isActive = number === activeStep;

  return (
    <div className="flex gap-4">
      <VerticalStepperItem
        number={number}
        isActive={isActive}
        isComplete={isComplete}
        isLast={isLast}
      />

      <div className="flex flex-col gap-1/2">
        <Typography variant="body1" fw="semibold" className="dark:text-mono-40">
          {title}
        </Typography>

        <Typography variant="body1" fw="normal" className="mb-8">
          {description}
        </Typography>
      </div>
    </div>
  );
};

/** @internal */
const VerticalStepperItem: FC<VerticalStepperItemProps> = ({
  isActive = false,
  isComplete: wasCompleted = false,
  isLast = false,
  number,
}) => {
  const isActiveClass =
    isActive || wasCompleted ? 'bg-gray-400 dark:text-mono-180' : 'bg-mono-160';

  const wasCompletedClass = wasCompleted ? 'bg-gray-400' : 'bg-mono-160';

  return (
    <div className="flex flex-col items-center">
      {/* Circle dot */}
      <div
        className={twMerge(
          'flex items-center justify-center px-3 py-1 rounded-full',
          isActiveClass
        )}
      >
        {number}
      </div>

      {/* Vertical line */}
      {!isLast && (
        <div className={twMerge('w-[2px] h-full', wasCompletedClass)} />
      )}
    </div>
  );
};
