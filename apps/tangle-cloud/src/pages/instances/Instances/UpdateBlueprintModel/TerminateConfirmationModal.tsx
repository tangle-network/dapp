import {
  Alert,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
} from '@tangle-network/ui-components';
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import BlueprintItem from '@tangle-network/tangle-shared-ui/components/blueprints/BlueprintGallery/BlueprintItem';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { FC, useEffect } from 'react';
import useAllBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useAllBlueprints';
import addCommasToNumber from '@tangle-network/ui-components/utils/addCommasToNumber';

type Props = {
  onClose: () => void;
  onConfirm: () => Promise<void>;
  selectedInstance: MonitoringBlueprint['services'][number] | null;
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
    return;
  }

  const blueprintStats = allBlueprints.get(
    selectedInstance.blueprint.toString(),
  );

  const instancesCount = blueprintStats?.instancesCount ?? 0;
  const operatorsCount = blueprintStats?.operatorsCount ?? 0;
  const restakersCount = blueprintStats?.restakersCount ?? 0;

  return (
    <ModalContent
      size="lg"
      onInteractOutside={(event) => event.preventDefault()}
      title={`Terminate Service Instance #${addCommasToNumber(selectedInstance.id)}`}
      description="Are you sure you want to terminate this service instance?"
    >
      <ModalHeader onClose={onClose} className="pb-4">
        Terminate Service Instance #{addCommasToNumber(selectedInstance.id)}
      </ModalHeader>

      <ModalBody>
        <BlueprintItem
          imgUrl={selectedInstance.blueprintData?.metadata.logo ?? ''}
          renderImage={(imageUrl) => {
            return (
              <img
                src={imageUrl}
                alt={selectedInstance.blueprintData?.metadata.name ?? ''}
                className="flex-shrink-0 bg-center rounded-full"
              />
            );
          }}
          instancesCount={instancesCount}
          operatorsCount={operatorsCount}
          restakersCount={restakersCount}
          isBoosted={false}
          category={selectedInstance.blueprintData?.metadata.category ?? ''}
          description={
            selectedInstance.blueprintData?.metadata.description ?? ''
          }
          name={selectedInstance.blueprintData?.metadata.name ?? ''}
          author={selectedInstance.blueprintData?.metadata.author ?? ''}
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
