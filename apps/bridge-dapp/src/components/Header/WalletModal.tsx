import { useWebContext } from '@webb-tools/api-provider-environment';
import { getPlatformMetaData } from '@webb-tools/browser-utils';
import { WalletConfig, walletsConfig } from '@webb-tools/dapp-config';
import { WalletId, WebbError } from '@webb-tools/dapp-types';
import {
  Modal,
  ModalContent,
  useWebbUI,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { is } from 'date-fns/locale';
import { FC, useCallback, useMemo } from 'react';

import { useConnectWallet } from '../../hooks';
import { getDefaultConnection } from '../../utils';

export const WalletModal: FC = () => {
  const {
    chain: selectedChain,
    connectingWalletId,
    failedWalletId,
    isModalOpen,
    resetState,
    selectedWallet,
    switchWallet,
    toggleModal,
    connectError,
  } = useConnectWallet();

  const { notificationApi } = useWebbUI();

  const { chains } = useWebContext();

  const chain = useMemo(() => {
    if (!selectedChain) {
      return getDefaultConnection(chains);
    }

    return selectedChain;
  }, [chains, selectedChain]);

  // Get the current failed or connecting wallet
  const getCurrentWallet = useCallback(() => {
    const walletId = failedWalletId ?? connectingWalletId;
    if (!walletId) {
      return undefined;
    }

    return chain.wallets[walletId];
  }, [chain, failedWalletId, connectingWalletId]);

  const isNotInstalledError = useMemo(() => {
    if (!connectError) {
      return false;
    }

    return WebbError.isWalletNotInstalledError(connectError);
  }, [connectError]);

  const errorMessage = useMemo(() => {
    if (!connectError) {
      return undefined;
    }

    return WebbError.getErrorMessage(connectError.code).message;
  }, [connectError]);

  // If the error about not installed wallet is shown,
  // we should show download button text
  const errorBtnText = useMemo(() => {
    if (!connectError || !isNotInstalledError) {
      return undefined;
    }

    const wallet = getCurrentWallet();
    if (!wallet) {
      return undefined;
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

  const handleWalletSelect = useCallback(
    (wallet: WalletConfig) => {
      switchWallet(chain, wallet);
    },
    [chain, switchWallet]
  );

  const handleDownloadBtnClick = useCallback(() => {
    const { id } = getPlatformMetaData();
    const wallet = getCurrentWallet();

    if (wallet?.installLinks?.[id]) {
      window.open(wallet.installLinks[id], '_blank');
    }
  }, [getCurrentWallet]);

  const handleTryAgainBtnClick = useCallback(async () => {
    if (!selectedWallet) {
      notificationApi.addToQueue({
        variant: 'warning',
        message: 'Switch wallet failed',
        secondaryMessage: 'No wallet selected. Please try again.',
      });
      return;
    }

    if (isNotInstalledError) {
      handleDownloadBtnClick();
      return;
    }

    await switchWallet(chain, selectedWallet);
  }, [
    selectedWallet,
    isNotInstalledError,
    switchWallet,
    chain,
    notificationApi,
    handleDownloadBtnClick,
  ]);

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        onCloseAutoFocus={handleCloseAutoFocus}
        isOpen={isModalOpen}
        isCenter
      >
        <WalletConnectionCard
          wallets={Object.values(chain.wallets)}
          onWalletSelect={handleWalletSelect}
          onClose={() => toggleModal(false)}
          connectingWalletId={connectingWalletId}
          errorBtnText={errorBtnText}
          errorMessage={errorMessage}
          failedWalletId={failedWalletId}
          onTryAgainBtnClick={handleTryAgainBtnClick}
          onDownloadBtnClick={handleDownloadBtnClick}
        />
      </ModalContent>
    </Modal>
  );
};
