import { FC, useCallback, useMemo, useState } from 'react';
import {
  Button,
  Input,
  ListStatus,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@tangle-network/ui-components';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { Search } from '@tangle-network/icons';
import { Blueprint } from '@tangle-network/tangle-shared-ui/types/blueprint';
import useOperatorBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorBlueprints';
import filterBy from '../../utils/filterBy';
import BlueprintSelectionListbox from './BlueprintSelectionListbox';

type Props = {
  operatorAddress?: SubstrateAddress;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setSelection: (selected: Blueprint['id'][]) => void;
};

const SelectBlueprintsModal: FC<Props> = ({
  operatorAddress,
  isOpen,
  setIsOpen,
  setSelection,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { blueprints } = useOperatorBlueprints(operatorAddress);

  const [localSelection, setLocalSelection] = useState<Blueprint['id'][]>([]);

  const filteredBlueprints = useMemo(() => {
    if (searchQuery === '') {
      return blueprints;
    }

    return blueprints.filter((blueprint) => {
      return filterBy(searchQuery, [
        blueprint.blueprint.metadata.name,
        blueprint.blueprint.metadata.author,
        blueprint.blueprint.metadata.description,
        blueprint.blueprint.metadata.category,
      ]);
    });
  }, [blueprints, searchQuery]);

  const handleSelect = useCallback((blueprintId: Blueprint['id']) => {
    setLocalSelection((prev) => {
      // Toggle the selection of the blueprint.
      // If the blueprint is already selected, unselect it.
      // Otherwise, select it.
      return prev.includes(blueprintId)
        ? prev.filter((id) => id !== blueprintId)
        : [...prev, blueprintId];
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    // If all blueprints are selected, unselect all.
    // Otherwise, select all.
    const newSelection =
      localSelection.length === blueprints.length
        ? []
        : blueprints.map((blueprint) => blueprint.blueprintId);

    setLocalSelection(newSelection);
  }, [blueprints, localSelection.length]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    setSelection(localSelection);
  }, [localSelection, setIsOpen, setSelection]);

  // Not yet ready.
  if (operatorAddress === undefined) {
    return;
  }

  const isEmpty = blueprints.length === 0;

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="lg">
        <ModalHeader>Select Blueprint(s)</ModalHeader>

        <ModalBody className="gap-4">
          {!isEmpty && (
            <Input
              id="restake-select-blueprints-search"
              isControlled
              rightIcon={<Search className="mr-2" />}
              placeholder="Search blueprints by name or author"
              value={searchQuery}
              onChange={setSearchQuery}
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
            />
          )}

          {!isEmpty ? (
            <BlueprintSelectionListbox
              blueprints={filteredBlueprints}
              selection={localSelection}
              setSelection={setLocalSelection}
            />
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
            isDisabled={isEmpty}
            onClick={handleSelectAll}
          >
            {blueprints.length === 0 ||
            localSelection.length !== blueprints.length
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
