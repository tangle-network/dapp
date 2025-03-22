import {
  Alert,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@tangle-network/ui-components';
import { MonitoringServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import BlueprintItem from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/BlueprintItem';
import { useState } from 'react';

type RejectConfirmationModalProps = {
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  selectedRequest: MonitoringServiceRequest | null;
};

function RejectConfirmationModal({
  onClose,
  onConfirm,
  selectedRequest,
}: RejectConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    setIsSubmitting(true);
    const isSuccess = await onConfirm();
    setIsSubmitting(false);
    if (!isSuccess) return;
    onClose();
  };

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Service Request #${selectedRequest?.requestId}`}
      description="Are you sure you want to reject this blueprint?"
    >
      <ModalHeader onClose={onClose} className="pb-4">
        Service Request #{selectedRequest?.requestId}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedRequest?.blueprintData?.metadata.logo ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedRequest?.blueprintData?.metadata.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
          id={selectedRequest?.blueprintData?.metadata.name ?? ''}
          // TODO
          restakersCount={selectedRequest?.blueprintData?.jobs.length ?? 0}
          // TODO
          operatorsCount={selectedRequest?.blueprintData?.operatorsCount ?? 0}
          // TODO
          tvl={'0'}
          isBoosted={false}
          category={selectedRequest?.blueprintData?.metadata.category ?? ''}
          description={
            selectedRequest?.blueprintData?.metadata.description ?? ''
          }
          name={selectedRequest?.blueprintData?.metadata.name ?? ''}
          author={selectedRequest?.blueprintData?.metadata.author ?? ''}
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
        onConfirm={onSubmit}
        hasCloseButton
      />
    </ModalContent>
  );
}

export default RejectConfirmationModal;
