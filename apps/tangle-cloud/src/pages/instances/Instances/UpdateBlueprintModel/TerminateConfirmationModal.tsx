import {
  Alert,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@tangle-network/ui-components';
import BlueprintItem from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/BlueprintItem';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { FC, useEffect } from 'react';
import {
  useAllBlueprints,
  type Service,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

// Service with optional blueprint metadata
interface ServiceWithBlueprint extends Service {
  blueprintData?: Blueprint;
}

type Props = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  selectedInstance: ServiceWithBlueprint | null;
  status: TxStatus;
};

const TerminateConfirmationModal: FC<Props> = ({
  onClose,
  onConfirm,
  selectedInstance,
  status,
}) => {
  const isSubmitting = status === TxStatus.PROCESSING;

  const { blueprints: allBlueprints } = useAllBlueprints();

  // Close the modal when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      onClose();
    }
  }, [status, onClose]);

  // Don't load the modal until the instance prop is given.
  if (selectedInstance === null) {
    return null;
  }

  const blueprintStats = allBlueprints?.get(
    selectedInstance.blueprintId.toString(),
  );

  const instancesCount = blueprintStats?.instancesCount ?? 0;
  const operatorsCount = blueprintStats?.operatorsCount ?? 0;
  const stakersCount = blueprintStats?.stakersCount ?? 0;

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Terminate Service Instance #${addCommasToNumber(Number(selectedInstance.serviceId))}`}
      description="Are you sure you want to terminate this service instance?"
    >
      <ModalHeader onClose={onClose} className="pb-4">
        Terminate Service Instance #
        {addCommasToNumber(Number(selectedInstance.serviceId))}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedInstance.blueprintData?.imgUrl ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedInstance.blueprintData?.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
          instancesCount={instancesCount}
          operatorsCount={operatorsCount}
          stakersCount={stakersCount}
          isBoosted={false}
          category={selectedInstance.blueprintData?.category ?? ''}
          description={selectedInstance.blueprintData?.description ?? ''}
          name={selectedInstance.blueprintData?.name ?? ''}
          author={selectedInstance.blueprintData?.author ?? ''}
        />

        <Alert
          className="mt-4"
          type="error"
          description="This will permanently stop the service instance. All ongoing operations will be halted and the instance will be moved to the stopped state. This action cannot be undone."
        />
      </ModalBody>

      <ModalFooterActions
        isConfirmDisabled={isSubmitting}
        isProcessing={isSubmitting}
        confirmButtonText="Terminate Instance"
        onConfirm={onConfirm}
        hasCloseButton
      />
    </ModalContent>
  );
};

export default TerminateConfirmationModal;
