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
import { ServiceType } from '../../types';
import ChooseMethodStep from './ChooseMethodStep';
import ConfirmAllocationsStep from './ConfirmAllocationsStep';
import IndependentAllocationStep from './IndependentAllocationStep';
import {
  ManageProfileModalContainerProps,
  RestakingAllocationMap,
} from './types';

export enum RestakingMethod {
  Independent,
  Shared,
}

/**
 * The steps in the manage profile modal.
 *
 * @remarks
 * The order of the steps is important, as it determines
 * the flow of the modal.
 */
enum Step {
  ChooseMethod,
  Allocation,
  ConfirmAllocations,
}

function getStepDiff(currentStep: Step, isNext: boolean): Step | null {
  const difference = isNext ? 1 : -1;

  if (Object.values(Step).includes(currentStep + difference)) {
    return currentStep + difference;
  }

  return null;
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
    case Step.ConfirmAllocations:
      return 'Review and Confirm Your Allocations:';
  }
}

function getStepNextButtonLabel(step: Step): string {
  switch (step) {
    case Step.ChooseMethod:
      return 'Next';
    case Step.Allocation:
      return 'Confirm';
    case Step.ConfirmAllocations:
      return 'Confirm and Proceed';
  }
}

function getStepPreviousButtonLabel(step: Step): string {
  switch (step) {
    case Step.ChooseMethod:
      return "What's the Difference?";
    case Step.Allocation:
      return 'Back';
    case Step.ConfirmAllocations:
      return 'Go Back and Edit';
  }
}

function getStepDescription(step: Step): string | null {
  switch (step) {
    case Step.ChooseMethod:
      return 'To participate in MPC services, allocate your staked TNT tokens using one of the available restaking methods. Your choice determines your risk allocation strategy. Would you like to restake as independent or shared?';
    case Step.Allocation:
      return 'Independent restaking allows you to allocate specific amounts of your stake to individual roles. Active roles may have their stake increased. Inactive roles are flexible for both stake adjustments and removal.';
    case Step.ConfirmAllocations:
      return null;
  }
}

const ManageProfileModalContainer: FC<ManageProfileModalContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [method, setMethod] = useState(RestakingMethod.Independent);
  const [step, setStep] = useState(Step.ChooseMethod);
  const isMountedRef = useIsMountedRef();
  let stepContents: ReactNode;

  const [allocations, setAllocations] = useState<RestakingAllocationMap>({
    [ServiceType.DKG_TSS_CGGMP]: null,
    [ServiceType.TX_RELAY]: null,
    [ServiceType.ZK_SAAS_GROTH16]: null,
    [ServiceType.ZK_SAAS_MARLIN]: null,
  });

  switch (step) {
    case Step.ChooseMethod:
      stepContents = <ChooseMethodStep method={method} setMethod={setMethod} />;
      break;
    case Step.Allocation:
      stepContents = (
        <IndependentAllocationStep
          allocations={allocations}
          setAllocations={setAllocations}
        />
      );
      break;
    case Step.ConfirmAllocations:
      stepContents = (
        <ConfirmAllocationsStep method={method} allocations={allocations} />
      );
  }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleNextStep = () => {
    const nextStep = getStepDiff(step, true);

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

  const stepDescription = getStepDescription(step);
  const previousStep = getStepDiff(step, false);

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
          {stepDescription !== null && (
            <Typography variant="body2" fw="normal">
              {stepDescription}
            </Typography>
          )}

          {stepContents}
        </div>

        <ModalFooter className="flex flex-row gap-2">
          <Button
            isFullWidth
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setStep(previousStep ?? Step.ChooseMethod)}
          >
            {getStepPreviousButtonLabel(step)}
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

export default ManageProfileModalContainer;
