import { getPlatformMetaData } from '@webb-tools/browser-utils';
import { Chain, walletsConfig } from '@webb-tools/dapp-config';
import { WalletId } from '@webb-tools/dapp-types';
import {
  Modal,
  ModalContent,
  WalletConnectionCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { useConnectWallet } from '../../hooks';

export type WalletModalProps = {
  chain: Chain;
};

export const WalletModal: FC<WalletModalProps> = ({ chain }) => {
  const { setMainComponent } = useWebbUI();
  const {
    isModalOpen,
    toggleModal,
    switchWallet,
    connectingWalletId,
    failedWalletId,
    selectedWallet,
  } = useConnectWallet(true);

  return (
    <Modal
      open={isModalOpen}
      onOpenChange={(open) => {
        toggleModal(open);

        if (!open) {
          setMainComponent(undefined);
        }
      }}
    >
      <ModalContent isOpen={isModalOpen} isCenter>
        <WalletConnectionCard
          wallets={Object.values(chain.wallets)}
          onWalletSelect={async (wallet) => {
            await switchWallet(chain, wallet);
          }}
          onClose={() => setMainComponent(undefined)}
          connectingWalletId={connectingWalletId}
          failedWalletId={failedWalletId}
          onTryAgainBtnClick={async () => {
            if (!selectedWallet) {
              throw new Error(
                'There is not selected wallet in try again function'
              );
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
