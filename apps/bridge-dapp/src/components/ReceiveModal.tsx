import { type FC, useCallback } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Typography,
  useCopyable,
} from '@webb-tools/webb-ui-components';
import { QRScanLineIcon } from '@webb-tools/icons';
import { shortenHex } from '@webb-tools/webb-ui-components';
import { useReceiveModal } from '../hooks';

const ReceiveModal: FC = () => {
  const { copy, isCopied } = useCopyable();
  const { isModalOpen, toggleModal, publicKey } = useReceiveModal();

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      toggleModal(isOpen);
    },
    [toggleModal]
  );

  const closeModal = useCallback(() => {
    toggleModal(false);
  }, [toggleModal]);

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        onCloseAutoFocus={closeModal}
        isOpen={isModalOpen}
        className="bg-mono-0 dark:bg-mono-180 w-full md:!w-[448px] rounded-2xl"
        isCenter
      >
        <ModalHeader onClose={closeModal} className="">
          Receive
        </ModalHeader>

        <div className="flex flex-col gap-9 p-9">
          <div className="flex gap-3">
            <div>
              <QRScanLineIcon size="lg" />
            </div>
            <div className="">
              <Typography
                variant="body2"
                fw="bold"
                className="dark:text-mono-0"
              >
                Receiving Shielded Funds
              </Typography>
              <Typography variant="body2" className="dark:text-mono-0">
                To receive shielded funds via transfers on the Hubble Bridge,
                simply copy and share your shielded account public key. This
                unique identifier allows others to transfer spend notes to your
                account.
              </Typography>
            </div>
          </div>
          <div className="rounded-lg p-4 bg-mono-20 dark:bg-mono-160 flex items-center justify-between gap-1">
            <Typography variant="body1" className="dark:text-mono-0">
              Account Public Key:
            </Typography>
            <Typography variant="body1" className="dark:text-mono-0">
              {publicKey ? shortenHex(publicKey, 5) : '--'}
            </Typography>
          </div>
        </div>

        <ModalFooter>
          {publicKey !== undefined && (
            <Button
              isFullWidth
              onClick={() => {
                copy(publicKey);
              }}
            >
              {isCopied ? 'Copied!' : 'Click to copy'}
            </Button>
          )}
          <Button variant="secondary" isFullWidth>
            Learn More
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReceiveModal;
