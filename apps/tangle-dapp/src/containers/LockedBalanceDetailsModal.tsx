import {
  Caption,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@tangle-network/ui-components';
import { FC } from 'react';
import LockedBalancesTable from './LockedBalancesTable';

export type LockedBalanceDetailsModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const LockedBalanceDetailsModal: FC<LockedBalanceDetailsModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="lg">
        <ModalHeader onClose={() => setIsOpen(false)}>
          Locked Balance Details
        </ModalHeader>

        <ModalBody>
          <LockedBalancesTable />

          <Caption>
            Most locks won't unlock automatically and will require manual action
            to release them. For example, vesting schedules must be manually
            claimed through a transaction.
          </Caption>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LockedBalanceDetailsModal;
