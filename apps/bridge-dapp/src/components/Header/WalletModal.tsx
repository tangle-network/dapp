import {
  useWebContext,
  useConnectWallet,
} from '@webb-tools/api-provider-environment';
import { getPlatformMetaData } from '@webb-tools/browser-utils';
import WalletNotInstalledError from '@webb-tools/dapp-types/errors/WalletNotInstalledError';
import {
  Modal,
  ModalContent,
  WalletConnectionCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useMemo } from 'react';

export const WalletModal: FC = () => {
  const {
    connectingWalletId,
    failedWalletId,
    isModalOpen,
    resetState,
    selectedWallet,
    connectWallet,
    toggleModal,
    connectError,
    supportedWallets,
  } = useConnectWallet();

  const { notificationApi } = useWebbUI();

  const { apiConfig } = useWebContext();

  // Get the current failed or connecting wallet
  const getCurrentWallet = useCallback(() => {
    const walletId = failedWalletId ?? connectingWalletId;
    if (!walletId) {
      return;
    }

    return apiConfig.wallets[walletId];
  }, [apiConfig.wallets, connectingWalletId, failedWalletId]);

  const isNotInstalledError = useMemo(() => {
    if (!connectError) {
      return false;
    }

    return (
      connectError instanceof WalletNotInstalledError && connectError.walletId
    );
  }, [connectError]);

  const errorMessage = useMemo(() => {
    if (!connectError) {
      return;
    }

    return connectError.message;
  }, [connectError]);

  // If the error about not installed wallet is shown,
  // we should show download button text
  const errorBtnText = useMemo(() => {
    if (!connectError || !isNotInstalledError) {
      return;
    }

    const wallet = getCurrentWallet();
    if (!wallet) {
      return;
    }

    const walletName = wallet?.name ?? 'Wallet';
    return `Download ${walletName}`;
  }, [connectError, getCurrentWallet, isNotInstalledError]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      toggleModal(isOpen);
    },
    [toggleModal]
  );

  const handleCloseAutoFocus = useCallback(() => {
    resetState();
  }, [resetState]);

  const platformId = useMemo(() => {
    try {
      const { id } = getPlatformMetaData();
      return id;
    } catch (error) {
      console.error(error);
    }
  }, []);

  const downloadURL = useMemo(() => {
    if (!platformId) return;

    const wallet = getCurrentWallet();

    if (wallet?.installLinks?.[platformId]) {
      return new URL(wallet.installLinks[platformId]);
    }
  }, [getCurrentWallet, platformId]);

  const handleTryAgainBtnClick = useCallback(
    async () => {
      if (!selectedWallet) {
        notificationApi.addToQueue({
          variant: 'warning',
          message: 'Failed to switch wallet',
          secondaryMessage: 'No wallet selected. Please try again.',
        });
        return;
      }

      if (isNotInstalledError) {
        window.open(downloadURL, '_blank');
        return;
      }

      await connectWallet(selectedWallet);
    },
    // prettier-ignore
    [connectWallet, downloadURL, isNotInstalledError, notificationApi, selectedWallet]
  );

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        onCloseAutoFocus={handleCloseAutoFocus}
        isOpen={isModalOpen}
        isCenter
      >
        <WalletConnectionCard
          wallets={supportedWallets}
          onWalletSelect={(nextWallet) => connectWallet(nextWallet)}
          onClose={() => toggleModal(false)}
          connectingWalletId={connectingWalletId}
          errorBtnText={errorBtnText}
          errorMessage={errorMessage}
          failedWalletId={failedWalletId}
          onTryAgainBtnClick={handleTryAgainBtnClick}
          downloadWalletURL={downloadURL}
        />
      </ModalContent>
    </Modal>
  );
};
