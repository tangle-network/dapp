import { useWebContext } from '@webb-tools/api-provider-environment';
import { getPlatformMetaData } from '@webb-tools/browser-utils';
import { walletsConfig } from '@webb-tools/dapp-config';
import { WalletId } from '@webb-tools/dapp-types';
import {
  Modal,
  ModalContent,
  WalletConnectionCard,
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
  } = useConnectWallet();

  const { chains } = useWebContext();

  const chain = useMemo(() => {
    if (!selectedChain) {
      return getDefaultConnection(chains).defaultChain;
    }

    return selectedChain;
  }, [chains, selectedChain]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      toggleModal(isOpen);
    },
    [toggleModal]
  );

  const handleCloseAutoFocus = useCallback(() => {
    resetState();
  }, [resetState]);

  return (
    <Modal open={isModalOpen} onOpenChange={handleOpenChange}>
      <ModalContent
        onCloseAutoFocus={handleCloseAutoFocus}
        isOpen={isModalOpen}
        isCenter
      >
        <WalletConnectionCard
          wallets={Object.values(chain.wallets)}
          onWalletSelect={async (wallet) => {
            await switchWallet(chain, wallet);
          }}
          onClose={() => toggleModal(false)}
          connectingWalletId={connectingWalletId}
          failedWalletId={failedWalletId}
          onTryAgainBtnClick={async () => {
            if (!selectedWallet) {
              throw new Error('No wallet selected. Please try again.');
            }
            await switchWallet(chain, selectedWallet);
          }}
          onDownloadBtnClick={() => {
            const { id } = getPlatformMetaData();

            window.open(
              walletsConfig[WalletId.MetaMask].installLinks?.[id],
              '_blank'
            );
          }}
        />
      </ModalContent>
    </Modal>
  );
};
