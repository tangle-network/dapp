import {
  Alert,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@tangle-network/ui-components';
import { MonitoringServiceRequest } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import BlueprintItem from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/BlueprintItem';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { FC, useEffect } from 'react';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

type Props = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  selectedRequest: MonitoringServiceRequest | null;
  status: TxStatus;
};

const RejectConfirmationModal: FC<Props> = ({
  onClose,
  onConfirm,
  selectedRequest,
  status,
}) => {
  const isSubmitting = status === TxStatus.PROCESSING;

  // Close the modal when the transaction is complete.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      onClose();
    }
  }, [status, onClose]);

  // Don't load the modal until the request prop is given.
  if (selectedRequest === null) {
    return;
  }

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Service Request #${addCommasToNumber(selectedRequest.requestId)}`}
      description="Are you sure you want to reject this request?"
    >
      <ModalHeader onClose={onClose} className="pb-4">
        Service Request #{addCommasToNumber(selectedRequest.requestId)}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedRequest.blueprintData?.metadata.logo ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedRequest.blueprintData?.metadata.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
          // TODO
          restakersCount={selectedRequest.blueprintData?.jobs.length ?? 0}
          // TODO
          operatorsCount={selectedRequest.blueprintData?.operatorsCount ?? 0}
          // TODO
          tvl={'0'}
          isBoosted={false}
          category={selectedRequest.blueprintData?.metadata.category ?? ''}
          description={
            selectedRequest.blueprintData?.metadata.description ?? ''
          }
          name={selectedRequest.blueprintData?.metadata.name ?? ''}
          author={selectedRequest.blueprintData?.metadata.author ?? ''}
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
