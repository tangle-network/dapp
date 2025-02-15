import cx from 'classnames';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { SteppedProgressProps } from './types';

const idleClsx = cx('bg-mono-40 dark:bg-mono-140');

const completedClsx = cx('bg-blue-40 dark:bg-blue-90');

const activeClsx = cx('bg-blue-70 dark:bg-blue-50');

const pausedClsx = cx('bg-blue-90 dark:bg-blue-120');

const SteppedProgress = forwardRef<HTMLUListElement, SteppedProgressProps>(
  ({ steps = 5, activeStep, paused, className, ...props }, ref) => {
    return (
      <ul
        {...props}
        ref={ref}
        className={twMerge('flex w-full gap-2 h-1', className)}
      >
        {Array.from({ length: steps }).map((_, i) => {
          const step = i + 1;
          const isCurrentStep = step === activeStep;
          const isCompletedStep =
            typeof activeStep === 'number' && step < activeStep;
          const isIdleStep = !isCurrentStep && !isCompletedStep;

          let stepClsx = '';
          if (isCurrentStep && !paused) {
            stepClsx = activeClsx;
          } else if (isCompletedStep && !paused) {
            stepClsx = completedClsx;
          } else if (paused && !isIdleStep) {
            stepClsx = pausedClsx;
          } else if (isIdleStep) {
            stepClsx = idleClsx;
          }

          return (
            <li
              key={step}
              className={twMerge(
                'flex-1',
                'rounded-full',
                'transition-all',
                'duration-300',
                stepClsx,
              )}
            />
          );
        })}
      </ul>
    );
  },
);

export default SteppedProgress;
