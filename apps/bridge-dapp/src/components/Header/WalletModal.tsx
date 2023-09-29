import { useWebContext } from '@webb-tools/api-provider-environment';
import { getPlatformMetaData } from '@webb-tools/browser-utils';
import { WalletConfig } from '@webb-tools/dapp-config';
import { WebbError } from '@webb-tools/dapp-types';
import {
  Modal,
  ModalContent,
  WalletConnectionCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
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

  const { apiConfig, chains, activeChain } = useWebContext();

  const chainToSwitchTo = useMemo(() => {
    if (!activeChain) {
      if (!selectedChain) {
        return getDefaultConnection(chains);
      }

      return selectedChain;
    }

    return activeChain;
  }, [activeChain, selectedChain, chains]);

  const supportedWalletCfgs = useMemo(() => {
    return chainToSwitchTo.wallets
      .map((walletId) => apiConfig.wallets[walletId])
      .filter((w) => !!w);
  }, [apiConfig.wallets, chainToSwitchTo.wallets]);

  // Get the current failed or connecting wallet
  const getCurrentWallet = useCallback(() => {
    const walletId = failedWalletId ?? connectingWalletId;
    if (!walletId) {
      return undefined;
    }

    if (!chainToSwitchTo.wallets.includes(walletId)) {
      return undefined;
    }

    return apiConfig.wallets[walletId];
  }, [
    failedWalletId,
    connectingWalletId,
    chainToSwitchTo.wallets,
    apiConfig.wallets,
  ]);

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
      switchWallet(chainToSwitchTo, wallet);
    },
    [switchWallet, chainToSwitchTo]
  );

  const downloadURL = useMemo(() => {
    const { id } = getPlatformMetaData();
    const wallet = getCurrentWallet();

    if (wallet?.installLinks?.[id]) {
      return new URL(wallet.installLinks[id]);
    }
  }, [getCurrentWallet]);

  const handleTryAgainBtnClick = useCallback(async () => {
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

    await switchWallet(chainToSwitchTo, selectedWallet);
  }, [
    selectedWallet,
    isNotInstalledError,
    switchWallet,
    chainToSwitchTo,
    notificationApi,
    downloadURL,
  ]);

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        onCloseAutoFocus={handleCloseAutoFocus}
        isOpen={isModalOpen}
        isCenter
      >
        <WalletConnectionCard
          wallets={supportedWalletCfgs}
          onWalletSelect={handleWalletSelect}
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
