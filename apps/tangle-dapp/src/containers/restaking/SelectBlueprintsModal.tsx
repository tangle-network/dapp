import { useCallback, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@tangle-network/ui-components';
import useOperatorBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorBlueprints';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';

type Props = {
  operatorAddress?: SubstrateAddress;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const SelectBlueprintsModal = ({
  operatorAddress,
  isOpen,
  setIsOpen,
}: Props) => {
  const { blueprints } = useOperatorBlueprints(operatorAddress);
  const [selection, setSelection] = useState<>();
  const handleSelect = useCallback(() => {}, [setIsOpen]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="lg">
        <ModalHeader>Select Blueprint(s)</ModalHeader>

        <ModalBody className="gap-4">blueprints</ModalBody>

        <ModalFooter>
          <Button
            isFullWidth
            variant="secondary"
            isDisabled={isProcessing}
            className="hidden sm:flex"
          >
            Select All
          </Button>

          <Button
            onClick={handleConfirm}
            isFullWidth
            className="!mt-0"
            isDisabled={isConfirmDisabled || isProcessing}
            isLoading={isProcessing}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelectBlueprintsModal;
