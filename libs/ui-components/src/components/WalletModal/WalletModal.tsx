'use client';

import { FC, useCallback, useMemo } from 'react';
import { Modal, ModalContent, ModalHeader } from '../Modal';
import { WalletConnectionCard } from '../WalletConnectionCard';
import { WalletModalProps } from './types';
import WalletNotInstalledError from '@tangle-network/dapp-types/errors/WalletNotInstalledError';

export const WalletModal: FC<WalletModalProps> = ({
  notificationApi,
  apiConfig,
  connectingWalletId,
  failedWalletId,
  isModalOpen,
  resetState,
  selectedWallet,
  connectWallet,
  toggleModal,
  connectError,
  supportedWallets,
  platformId,
  targetTypedChainIds,
  contentDefaultText,
}) => {
  // Get the current failed or connecting wallet.
  const getCurrentWallet = useCallback(() => {
    const walletId = failedWalletId ?? connectingWalletId;

    if (!walletId) {
      return;
    }

    return apiConfig.wallets[walletId];
  }, [apiConfig.wallets, connectingWalletId, failedWalletId]);

  const errorMessage = (() => {
    if (!connectError) {
      return;
    }

    return connectError.message;
  })();

  const downloadUrl = useMemo(() => {
    if (platformId == null) {
      return;
    }

    const wallet = getCurrentWallet();

    if (wallet?.installLinks?.[platformId]) {
      return new URL(wallet.installLinks[platformId]);
    }
  }, [getCurrentWallet, platformId]);

  const handleTryAgainBtnClick = useCallback(async () => {
    if (connectError instanceof WalletNotInstalledError) {
      return;
    }

    if (!selectedWallet) {
      notificationApi.addToQueue({
        variant: 'warning',
        message: 'Failed to switch wallet',
        secondaryMessage: 'No wallet selected. Please try again.',
      });
      return;
    }

    await connectWallet(selectedWallet, targetTypedChainIds);
  }, [
    connectError,
    selectedWallet,
    connectWallet,
    targetTypedChainIds,
    notificationApi,
  ]);

  return (
    <Modal open={isModalOpen} onOpenChange={toggleModal}>
      <ModalContent
        onCloseAutoFocus={() => resetState()}
        className="overflow-hidden"
      >
        <ModalHeader className="pb-4 border-b border-mono-40 dark:border-mono-160">
          Connect Wallet
        </ModalHeader>

        <WalletConnectionCard
          wallets={supportedWallets}
          onWalletSelect={(nextWallet) =>
            connectWallet(nextWallet, targetTypedChainIds)
          }
          onClose={() => toggleModal(false)}
          connectingWalletId={connectingWalletId}
          errorMessage={errorMessage}
          failedWalletId={failedWalletId}
          onTryAgainBtnClick={handleTryAgainBtnClick}
          errorBtnText={
            connectError instanceof WalletNotInstalledError
              ? 'Download'
              : 'Try Again'
          }
          tryAgainBtnProps={
            connectError instanceof WalletNotInstalledError
              ? {
                  href: downloadUrl?.toString(),
                  target: '_blank',
                }
              : {}
          }
          downloadWalletURL={downloadUrl}
          contentDefaultText={contentDefaultText}
        />
      </ModalContent>
    </Modal>
  );
};
