import { type FC, useCallback, useState } from 'react';
import {
  Button,
  CheckBox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Typography,
} from '@webb-tools/webb-ui-components';
import { DeleteBinIcon } from '@webb-tools/icons';
import { useWebbUI } from '@webb-tools/webb-ui-components';
import { getErrorMessage } from '../../utils/index.js';

const ClearTxHistoryModal: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  clearTxHistory: () => Promise<void>;
  downloadTxHistory: () => void;
}> = ({ isOpen, setIsOpen, clearTxHistory, downloadTxHistory }) => {
  const { notificationApi } = useWebbUI();

  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsCheckboxChecked(false);
  }, [setIsOpen]);

  const handleClearTxHistory = useCallback(async () => {
    try {
      await clearTxHistory();
      notificationApi.addToQueue({
        variant: 'success',
        message: 'Transaction history deleted',
      });
    } catch (error) {
      const message = getErrorMessage(error);
      notificationApi.addToQueue({
        variant: 'error',
        message: 'Failed to delete transaction history',
        secondaryMessage: message,
      });
    } finally {
      closeModal();
    }
  }, [clearTxHistory, closeModal, notificationApi]);

  return (
    <Modal open={isOpen} onOpenChange={(isOpen) => setIsOpen(isOpen)}>
      <ModalContent
        onCloseAutoFocus={closeModal}
        isOpen={isOpen}
        className="bg-mono-0 dark:bg-mono-180 w-full md:!w-[448px] rounded-2xl"
        isCenter
      >
        <ModalHeader onClose={closeModal}>Clear Data</ModalHeader>

        <div className="p-9 space-y-9">
          <div className="flex gap-3">
            <div>
              <DeleteBinIcon size="lg" />
            </div>
            <div className="space-y-6">
              <Typography
                variant="body1"
                className="text-mono-200 dark:text-mono-0"
              >
                All transaction history will be permanently deleted from local
                storage. You may want to download of these before deleting.
              </Typography>
              <Typography
                variant="body1"
                className="text-mono-200 dark:text-mono-0"
              >
                This cannot be undone. Please ensure that you are deleting the
                correct account.
              </Typography>
            </div>
          </div>

          <CheckBox
            isChecked={isCheckboxChecked}
            onChange={() => {
              setIsCheckboxChecked(!isCheckboxChecked);
            }}
          >
            I understand this action is irreversible.
          </CheckBox>
        </div>

        <ModalFooter>
          <Button isFullWidth onClick={downloadTxHistory}>
            Download
          </Button>
          <Button
            isDisabled={!isCheckboxChecked}
            variant="secondary"
            isFullWidth
            onClick={handleClearTxHistory}
          >
            Clear Transaction Data
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClearTxHistoryModal;
