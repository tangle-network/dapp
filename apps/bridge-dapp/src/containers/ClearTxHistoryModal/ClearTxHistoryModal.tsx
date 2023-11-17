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
import { useTxClientStorage } from '@webb-tools/api-provider-environment';
import { getErrorMessage } from '../../utils';

const ClearTxHistoryModal: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const { notificationApi } = useWebbUI();
  const { clearTxHistory } = useTxClientStorage();

  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleClearTxHistory = useCallback(() => {
    try {
      clearTxHistory();
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
          {/* TODO: update onClick */}
          <Button
            isFullWidth
            onClick={() => {
              return;
            }}
          >
            Download
          </Button>
          <Button
            isDisabled={!isCheckboxChecked}
            variant="secondary"
            isFullWidth
            onClick={handleClearTxHistory}
          >
            Delete Notes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClearTxHistoryModal;
