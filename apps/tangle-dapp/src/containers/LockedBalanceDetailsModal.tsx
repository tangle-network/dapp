import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
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
    <Modal>
      <ModalContent
        onInteractOutside={() => setIsOpen(false)}
        onCloseAutoFocus={() => setIsOpen(false)}
        isOpen={isOpen}
        size="lg"
      >
        <ModalHeader onClose={() => setIsOpen(false)}>
          Locked Balance Details
        </ModalHeader>

        <ModalBody className="overflow-clip">
          <Typography variant="body1" fw="normal">
            Below are your locked balances and the relevant details of each
            lock.
          </Typography>

          <LockedBalancesTable />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LockedBalanceDetailsModal;
