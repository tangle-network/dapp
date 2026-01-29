import Button from '@tangle-network/ui-components/components/buttons/Button';
import { FC } from 'react';

type StepNavigationProps = {
  isFirstStep: boolean;
  isLastStep: boolean;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

const StepNavigation: FC<StepNavigationProps> = ({
  isFirstStep,
  isLastStep,
  isNextDisabled = false,
  isSubmitting = false,
  onBack,
  onNext,
  onSubmit,
}) => {
  return (
    <div className="flex gap-4 pt-4 border-t border-mono-80 dark:border-mono-160">
      <Button
        variant="secondary"
        isFullWidth
        onClick={onBack}
        isDisabled={isFirstStep || isSubmitting}
      >
        Back
      </Button>

      {isLastStep ? (
        <Button
          isFullWidth
          onClick={onSubmit}
          isLoading={isSubmitting}
          isDisabled={isSubmitting}
        >
          Register
        </Button>
      ) : (
        <Button isFullWidth onClick={onNext} isDisabled={isNextDisabled}>
          Next
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;
