import { CheckboxCircleLine, WalletLineIcon } from '@webb-tools/icons';
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
import ModalIcon, { ModalIconCommonVariant } from './ModalIcon';
import { UnstakeRequestItem } from './UnstakeRequestsTable';

export type UnstakeRequestSubmittedModalProps = {
  isOpen: boolean;
  unstakeRequest: UnstakeRequestItem;
  onClose: () => void;
};

const UnstakeRequestSubmittedModal: FC<UnstakeRequestSubmittedModalProps> = ({
  isOpen,
  unstakeRequest,
  onClose,
}) => {
  const handleAddTokenToWallet = useCallback(() => {
    // TODO: Handle this case.
  }, []);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={onClose}>
          Unstake Request Submitted
        </ModalHeader>

        <div className="flex flex-col items-center justify-center gap-2 p-9">
          <ModalIcon
            commonVariant={ModalIconCommonVariant.SUCCESS}
            Icon={CheckboxCircleLine}
          />

          <Typography
            className="dark:text-mono-0 text-center"
            variant="body1"
            fw="normal"
          >
            After the unbonding period, you can redeem this Unstake NFT to
            withdraw unstaked tokens.
          </Typography>

          {/* TODO: External link's href. */}
          <ExternalLink href="#">Learn More</ExternalLink>
        </div>

        <ModalFooter className="flex px-8 py-6 space-y-0">
          <Button
            onClick={handleAddTokenToWallet}
            isFullWidth
            variant="primary"
            rightIcon={<WalletLineIcon />}
          >
            Add Token to Wallet
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UnstakeRequestSubmittedModal;
