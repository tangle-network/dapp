import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode, useEffect, useState } from 'react';

import useIsMountedRef from '../../hooks/useIsMountedRef';
import AllocationStep from './AllocationStep';
import ChooseMethodStep from './ChooseMethodStep';
import { ManageIndependentProfileModalContainerProps } from './types';

export enum RestakingMethod {
  Independent,
  Shared,
}

enum Step {
  ChooseMethod,
  Allocation,
}

function getNextStep(currentStep: Step): Step | null {
  switch (currentStep) {
    case Step.ChooseMethod:
      return Step.Allocation;
    case Step.Allocation:
      return null;
  }
}

function getStepTitle(step: Step, method: RestakingMethod): string {
  switch (step) {
    case Step.ChooseMethod:
      return 'Choose Your Restaking Method';
    case Step.Allocation: {
      const profileKindString =
        method === RestakingMethod.Independent ? 'Independent' : 'Shared';

      return `Manage ${profileKindString} Profile`;
    }
  }
}

function getStepNextButtonLabel(step: Step): string {
  switch (step) {
    case Step.ChooseMethod:
      return 'Next';
    case Step.Allocation:
      return 'Confirm';
  }
}

function getStepDescription(step: Step): string {
  switch (step) {
    case Step.ChooseMethod:
      return 'To participate in MPC services, allocate your staked TNT tokens using one of the available restaking methods. Your choice determines your risk allocation strategy. Would you like to restake as independent or shared?';
    case Step.Allocation:
      return 'Independent restaking allows you to allocate specific amounts of your stake to individual roles. Active roles may have their stake increased. Inactive roles are flexible for both stake adjustments and removal.';
  }
}

const ManageIndependentProfileModalContainer: FC<
  ManageIndependentProfileModalContainerProps
> = ({ isModalOpen, setIsModalOpen }) => {
  const [method, setMethod] = useState(RestakingMethod.Independent);
  const [step, setStep] = useState(Step.ChooseMethod);
  const isMountedRef = useIsMountedRef();
  let stepContents: ReactNode;

  switch (step) {
    case Step.ChooseMethod:
      stepContents = <ChooseMethodStep method={method} setMethod={setMethod} />;
      break;
    case Step.Allocation:
      stepContents = <AllocationStep />;
      break;
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNextStep = () => {
    const nextStep = getNextStep(step);

    // Have reached the end. Close the modal.
    if (nextStep === null) {
      closeModal();
    } else {
      setStep(nextStep);
    }
  };

  // Reset state when modal is closed.
  useEffect(() => {
    if (isModalOpen) {
      return;
    }

    // Use a timeout to prevent the state reset from being visible
    // to the user as the modal is closing (the closing animation takes
    // a few hundred milliseconds to complete).
    const timeoutHandle = setTimeout(() => {
      if (isMountedRef.current) {
        setMethod(RestakingMethod.Independent);
        setStep(Step.ChooseMethod);
      }
    }, 500);

    return () => clearTimeout(timeoutHandle);
  }, [isModalOpen, isMountedRef]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[800px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader
          titleVariant="h4"
          onClose={closeModal}
          className="p-9 pb-4"
        >
          {getStepTitle(step, method)}
        </ModalHeader>

        <div className="flex flex-col gap-4 p-9">
          <Typography variant="body2" fw="normal">
            {getStepDescription(step)}
          </Typography>

          {stepContents}
        </div>

        <ModalFooter className="flex flex-row gap-2">
          <Button
            isFullWidth
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            What&apos;s the difference?
          </Button>

          <Button
            onClick={handleNextStep}
            isFullWidth
            target="_blank"
            rel="noopener noreferrer"
            className="!mt-0"
          >
            {getStepNextButtonLabel(step)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ManageIndependentProfileModalContainer;
