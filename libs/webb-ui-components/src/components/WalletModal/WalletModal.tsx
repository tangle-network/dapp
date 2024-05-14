'use client';

import { forwardRef, useCallback, useMemo } from 'react';
import { Modal, ModalContent } from '../Modal/index.js';
import { WalletConnectionCard } from '../WalletConnectionCard/index.js';
import { WalletModalProps } from './types.js';

export const WalletModal = forwardRef<HTMLDivElement, WalletModalProps>(
  (
    {
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
      ...props
    },
    ref
  ) => {
    // Get the current failed or connecting wallet
    const getCurrentWallet = useCallback(() => {
      const walletId = failedWalletId ?? connectingWalletId;
      if (!walletId) {
        return;
      }

      return apiConfig.wallets[walletId];
    }, [apiConfig.wallets, connectingWalletId, failedWalletId]);

    const errorMessage = useMemo(() => {
      if (!connectError) {
        return;
      }

      return connectError.message;
    }, [connectError]);

    const handleOpenChange = useCallback(
      (isOpen: boolean) => {
        toggleModal(isOpen);
      },
      [toggleModal]
    );

    const downloadURL = useMemo(() => {
      if (platformId == null) return;

      const wallet = getCurrentWallet();

      if (wallet?.installLinks?.[platformId]) {
        return new URL(wallet.installLinks[platformId]);
      }
    }, [getCurrentWallet, platformId]);

    const handleTryAgainBtnClick = useCallback(async () => {
      if (!selectedWallet) {
        notificationApi.addToQueue({
          variant: 'warning',
          message: 'Failed to switch wallet',
          secondaryMessage: 'No wallet selected. Please try again.',
        });
        return;
      }

      await connectWallet(selectedWallet);
    }, [connectWallet, notificationApi, selectedWallet]);

    return (
      <div ref={ref} {...props}>
        <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
          <ModalContent
            isOpen={isModalOpen}
            isCenter
            onCloseAutoFocus={() => resetState()}
          >
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
              downloadWalletURL={downloadURL}
              contentDefaultText={contentDefaultText}
            />
          </ModalContent>
        </Modal>
      </div>
    );
  }
);
