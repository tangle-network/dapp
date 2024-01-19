'use client';

import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import useChooseWalletModal from '../../hooks/useChooseWalletModal';

const ChooseWalletTypeModalContainer: FC = () => {
  const { toggleModal } = useConnectWallet();
  const { isSelectWalletTypeModalOpen, setIsSelectWalletTypeModalOpen } =
    useChooseWalletModal();

  return (
    <Modal
      open={isSelectWalletTypeModalOpen}
      onOpenChange={(isOpen) => setIsSelectWalletTypeModalOpen(isOpen)}
    >
      <ModalContent
        isOpen={isSelectWalletTypeModalOpen}
        isCenter
        className="rounded-xl max-w-full w-[420px] bg-mono-0 dark:bg-mono-160"
      >
        <ModalHeader onClose={() => setIsSelectWalletTypeModalOpen(false)}>
          Choose Wallet Type
        </ModalHeader>

        <div className="px-9 py-6 space-y-3">
          <Button
            isFullWidth
            onClick={() => {
              setIsSelectWalletTypeModalOpen(false);
              toggleModal(true);
            }}
          >
            Connect EVM Wallet
          </Button>
          <Button
            isFullWidth
            onClick={() => {
              setIsSelectWalletTypeModalOpen(false);
              toggleModal(true);
            }}
            variant="secondary"
          >
            Connect Substrate Wallet
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default ChooseWalletTypeModalContainer;
