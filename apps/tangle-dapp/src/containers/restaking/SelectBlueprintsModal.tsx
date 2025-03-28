import { useCallback, useState } from 'react';
import {
  Button,
  ListStatus,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@tangle-network/ui-components';
import useOperatorBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorBlueprints';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import BlueprintGridItem from '../../components/restaking/BlueprintGridItem';

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
  const [selection, setSelection] = useState<number[]>([]);

  const handleSelect = useCallback((blueprintId: number) => {
    setSelection((prev) => {
      return prev.includes(blueprintId)
        ? prev.filter((id) => id !== blueprintId)
        : [...prev, blueprintId];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    // If all blueprints are selected, unselect all.
    // Otherwise, select all.
    const newSelection =
      selection.length === blueprints.length
        ? []
        : blueprints.map((blueprint) => blueprint.blueprintId);

    setSelection(newSelection);
  }, [blueprints, selection.length]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Not yet ready.
  if (operatorAddress === undefined) {
    return;
  }

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="lg">
        <ModalHeader>Select Blueprint(s)</ModalHeader>

        <ModalBody className="gap-4">
          {blueprints.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {blueprints.map((blueprint) => (
                <BlueprintGridItem
                  key={blueprint.blueprintId}
                  onClick={() => handleSelect(blueprint.blueprintId)}
                  blueprint={blueprint}
                />
              ))}
            </div>
          ) : (
            <ListStatus
              title="No Blueprints Available"
              description="It seems that this operator hasn't registered for any blueprints yet. Check back later."
              className="px-8 py-14"
            />
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            isFullWidth
            variant="secondary"
            // Disable if there are no blueprints available.
            isDisabled={blueprints.length === 0}
            className="hidden sm:flex"
            onClick={handleSelectAll}
          >
            {selection.length === blueprints.length || selection.length !== 0
              ? 'Select'
              : 'Unselect'}{' '}
            All
          </Button>

          <Button onClick={handleConfirm} isFullWidth className="!mt-0">
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelectBlueprintsModal;
