'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { useWebbUI, WalletModal } from '@webb-tools/webb-ui-components';

export const WalletModalContainer = () => {
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

  return (
    <WalletModal
      connectingWalletId={connectingWalletId}
      failedWalletId={failedWalletId}
      isModalOpen={isModalOpen}
      resetState={resetState}
      selectedWallet={selectedWallet}
      connectWallet={connectWallet}
      toggleModal={toggleModal}
      connectError={connectError}
      supportedWallets={supportedWallets}
      notificationApi={notificationApi}
      apiConfig={apiConfig}
    />
  );
};
