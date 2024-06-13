'use client';

import {
  // Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  // Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

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

        {/* Modal Content */}

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          {/* Confirm Button */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BridgeConfirmationModal;
