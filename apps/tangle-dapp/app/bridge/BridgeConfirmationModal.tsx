'use client';

import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import FeeDetails from './FeeDetails';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
}

const BridgeConfirmationModal: FC<BridgeConfirmationModalProps> = ({
  isOpen,
  handleClose,
}) => {
  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={handleClose}>
          Bridge Confirmation
        </ModalHeader>

        <div className="p-9">
          <FeeDetails />
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button isFullWidth>Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BridgeConfirmationModal;
