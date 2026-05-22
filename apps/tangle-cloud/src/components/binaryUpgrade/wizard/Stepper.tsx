import type { FC } from 'react';
import { WIZARD_STEPS, type WizardStepId } from './types';

/**
 * Linear breadcrumb-style stepper across the top of the publish wizard.
 *
 * The wizard is strictly forward-linear; back-navigation is allowed up to the
 * most recent reachable step (the parent dialog tracks `furthestStep` so the
 * user can't jump ahead past a gating step like "no hash computed yet").
 */
interface StepperProps {
  currentStep: WizardStepId;
  furthestStep: WizardStepId;
  onJump: (step: WizardStepId) => void;
}

export const Stepper: FC<StepperProps> = ({
  currentStep,
  furthestStep,
  onJump,
}) => (
  <ol className="flex w-full items-center gap-2">
    {WIZARD_STEPS.map((step, idx) => {
      const isCurrent = step.id === currentStep;
      const isReachable = step.id <= furthestStep;
      const isPast = step.id < currentStep;

      return (
        <li key={step.id} className="flex flex-1 items-center gap-2">
          <button
            type="button"
            disabled={!isReachable}
            onClick={() => isReachable && onJump(step.id)}
            className={[
              'flex items-center gap-2 text-left',
              isReachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
            ].join(' ')}
          >
            <span
              className={[
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                isCurrent
                  ? 'bg-primary text-primary-foreground'
                  : isPast
                    ? 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {isPast ? '✓' : step.id}
            </span>
            <span
              className={[
                'text-xs font-semibold uppercase tracking-wider',
                isCurrent ? 'text-foreground' : 'text-muted-foreground',
              ].join(' ')}
            >
              {step.title}
            </span>
          </button>
          {idx < WIZARD_STEPS.length - 1 && (
            <span
              aria-hidden
              className={[
                'mx-1 h-px flex-1',
                step.id < currentStep ? 'bg-success/30' : 'bg-border',
              ].join(' ')}
            />
          )}
        </li>
      );
    })}
  </ol>
);

export default Stepper;
