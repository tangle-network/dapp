import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import getPlatformMetaData from '@webb-tools/browser-utils/platform/getPlatformMetaData';
import { WalletModal, useWebbUI } from '@webb-tools/webb-ui-components';

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
      platformId={getPlatformMetaData()?.id ?? null}
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
      contentDefaultText="Connect your wallet to start bridging your tokens privately across chains"
    />
  );
};
