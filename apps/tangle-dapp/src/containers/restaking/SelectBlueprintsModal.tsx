import { useCallback, useMemo, useState } from 'react';
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
import useOperatorBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorBlueprints';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import BlueprintGridItem from '../../components/restaking/BlueprintGridItem';
import { Search } from '@tangle-network/icons';
import { OperatorBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import filterBy from '../../utils/filterBy';

type Props = {
  operatorAddress?: SubstrateAddress;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setSelection: (selected: number[]) => void;
};

const SelectBlueprintsModal = ({
  operatorAddress,
  isOpen,
  setIsOpen,
  setSelection,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  // const { blueprints } = useOperatorBlueprints(operatorAddress);
  const blueprints = useMemo<OperatorBlueprint[]>(
    () => [
      {
        blueprintId: 1,
        blueprint: {
          metadata: { name: 'Test', author: 'Test' } as any,
        } as any,
      } as any,
    ],
    [],
  );

  const [localSelection, setLocalSelection] = useState<number[]>([]);

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

  const handleSelect = useCallback((blueprintId: number) => {
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
  }, [setIsOpen]);

  // Not yet ready.
  if (operatorAddress === undefined) {
    return;
  }

  const isEmpty = blueprints.length === 0;

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="lg">
        <ModalHeader>Select Blueprint(s)</ModalHeader>

        {!isEmpty && (
          <div className="pt-4 px-4 pb-4 md:px-9">
            <Input
              id="restake-select-blueprints-search"
              isControlled
              rightIcon={<Search className="mr-2" />}
              placeholder="Search blueprints by name or author"
              value={searchQuery}
              onChange={setSearchQuery}
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
            />
          </div>
        )}

        <ModalBody className="gap-4">
          {!isEmpty ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredBlueprints.map((blueprint) => (
                <BlueprintGridItem
                  key={blueprint.blueprintId}
                  isSelected={localSelection.includes(blueprint.blueprintId)}
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
            isDisabled={isEmpty}
            className="hidden sm:flex"
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
