import { CloseCircleLineIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback } from 'react';

import ExternalLink from './ExternalLink';
import ModalIcon from './ModalIcon';

export type CancelUnstakeModalProps = {
  isOpen: boolean;
  unlockId: number;
  onClose: () => void;
};

const CancelUnstakeModal: FC<CancelUnstakeModalProps> = ({
  isOpen,
  // TODO: Make use of the unstake request data, which is relevant for the link's href.
  unlockId: _unlockId,
  onClose,
}) => {
  const handleConfirm = useCallback(() => {
    // TODO: Set button as loading, disable ability to close modal, and proceed to execute the unstake cancellation via its corresponding extrinsic call.
  }, []);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={onClose}>
          Cancel Unstake
        </ModalHeader>

        <div className="flex flex-col items-center justify-center gap-2 p-9">
          <ModalIcon Icon={CloseCircleLineIcon} />

          <Typography
            className="dark:text-mono-0 text-center"
            variant="body1"
            fw="normal"
          >
            Are you sure you want to cancel your unstaking request? By
            cancelling, your tokens will remain staked and continue earning
            rewards.
          </Typography>

          {/* TODO: External link's href. */}
          <ExternalLink href="#">Learn More</ExternalLink>
        </div>

        <ModalFooter className="flex gap-1 px-8 py-6 space-y-0">
          <Button onClick={onClose} isFullWidth variant="secondary">
            Cancel
          </Button>

          <Button onClick={handleConfirm} isFullWidth variant="primary">
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CancelUnstakeModal;
