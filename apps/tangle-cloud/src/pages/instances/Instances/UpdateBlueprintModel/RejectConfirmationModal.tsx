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
  type ServiceRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import type { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

// Service request with optional blueprint metadata
interface ServiceRequestWithBlueprint extends ServiceRequest {
  blueprintData?: Blueprint;
}

type Props = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  selectedRequest: ServiceRequestWithBlueprint | null;
  status: TxStatus;
};

const RejectConfirmationModal: FC<Props> = ({
  onClose,
  onConfirm,
  selectedRequest,
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

  // Don't load the modal until the request prop is given.
  if (selectedRequest === null) {
    return null;
  }

  const blueprintStats = allBlueprints?.get(
    selectedRequest.blueprintId.toString(),
  );

  const instancesCount = blueprintStats?.instancesCount ?? 0;
  const operatorsCount = blueprintStats?.operatorsCount ?? 0;
  const restakersCount = blueprintStats?.restakersCount ?? 0;

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Service Request #${addCommasToNumber(Number(selectedRequest.requestId))}`}
      description="Are you sure you want to reject this request?"
    >
      <ModalHeader onClose={onClose} className="pb-4">
        Service Request #{addCommasToNumber(Number(selectedRequest.requestId))}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedRequest.blueprintData?.imgUrl ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedRequest.blueprintData?.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
          instancesCount={instancesCount}
          operatorsCount={operatorsCount}
          restakersCount={restakersCount}
          isBoosted={false}
          category={selectedRequest.blueprintData?.category ?? ''}
          description={selectedRequest.blueprintData?.description ?? ''}
          name={selectedRequest.blueprintData?.name ?? ''}
          author={selectedRequest.blueprintData?.author ?? ''}
        />

        <Alert
          className="mt-4"
          type="error"
          description="Are you sure you want to reject this service request?"
        />
      </ModalBody>
      <ModalFooterActions
        isConfirmDisabled={isSubmitting}
        isProcessing={isSubmitting}
        confirmButtonText="Reject"
        onConfirm={onConfirm}
        hasCloseButton
      />
    </ModalContent>
  );
};

export default RejectConfirmationModal;
